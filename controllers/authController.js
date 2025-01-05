const User = require('../models/User');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 626 ms
exports.register = async (req, res) => {
  try {
    const {firstName, lastName, email, password } = req.body;
    if (
        !firstName ||
        !lastName ||
        !email ||
        !password 
      ) {
        return res.status(403).json({
          success: false,
          message: "All fields are required",
        });
      }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const user = await User.create({firstName,lastName, email, password: hashedPassword ,image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`});

    const token = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });
// Save token to user document in database
user.token = token; //toObject....need
user.password = undefined;

// 
// console.log("token in backend storage afetr signUp ", token)

//create cookie and send response.. // Set cookie for token and return success response
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Only set cookies over HTTPS in production
        sameSite: 'None',  // Allow cross-origin cookies (important for cross-origin requests)

      }
     return res.cookie("token", token, options).status(200).json({
        success: true,
        token : token,
        user,
        message:  `User registered Successfully`,
      })


  return  res.status(201).json({
    success: true,
      user,
  token,
    message: 'User registered successfully' });




  } catch (err) {
    return res.status(500).json({
success: false,
 message: 'Registration failed'


    })
    
  }
};


// optimised version -> 602 ms
// exports.register = async (req, res) => {
//   try {
//     const { firstName, lastName, email, password } = req.body;

//     // Validate Required Fields
//     if (!firstName || !lastName || !email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required",
//       });
//     }

//     // Check if User Already Exists
//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({
//         success: false,
//         message: 'User already exists',
//       });
//     }

//     // Hash Password
//     const hashedPassword = await bcryptjs.hash(password, 10);

//     // Create User with Token
//     const token = jwt.sign({ email, id: userExists?._id }, process.env.JWT_SECRET, {
//       expiresIn: '24h',
//     });

//     const user = await User.create({
//       firstName,
//       lastName,
//       email,
//       password: hashedPassword,
//       image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
//       token,
//     });

//     // Remove password from response
//     const userWithoutPassword = user.toObject();
//     delete userWithoutPassword.password;

//     // Set Cookie Options
//     const options = {
//       expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
//     };

//     // Send Response with Token in Cookie
//     return res.cookie('token', token, options).status(201).json({
//       success: true,
//       user: userWithoutPassword,
//       token,
//       message: 'User registered successfully',
//     });
//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       message: err.message || 'Registration failed',
//     });
//   }
// };



// 270ms

// exports.login = async (req, res) => {
//   // console.log("FE se login call aa rha")
//   try {
//     const { email, password } = req.body;
//         // 2.validation data
//         if (!email || !password) {
//             return res.status(400).json({
//               success: false,
//               message: `All fields are required, please try again`,
//             })
//           }
//           // console.log("mail pwd of login credential", email, password)
//     const user = await User.findOne({ email });
//     // console.log("user after login",user)
//     if (!user) {
//       return res.status(400).json({ message: `User is not registered,please signup first` });
//     }

//     const isMatch = await bcryptjs.compare(password, user.password);
// //     console.log("db password",user.password)
// //     console.log("Type of input password:", typeof password); // Should be 'string'
// // console.log("Type of stored password:", typeof user.password); // Should be 'string'

//     // console.log("ismatched??",isMatch)
//     if (!isMatch) {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }

//     const token = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: '24h',
//     });
// // Save token to user document in database
// user.token = token; //toObject....need
// user.password = undefined;

// // 
// // console.log("token in backend storage afetr login[user.token] wala ", user.token)
// // console.log("token in backend storage afetr login ", token)

// //.create cookie and send response.. // Set cookie for token and return success response
// const options = {
//   expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
//   httpOnly: true,
//   secure: process.env.NODE_ENV === 'production',
//   sameSite: 'None',
// };

//    return res.cookie("token", token, options).status(200).json({
//         success: true,
//         token ,
//         user,
//         message:  `User Login Success`,
//       })

//    return res.json({ success: true, token,user, message:  `User Login Success`, });
//   } catch (err) {
//    return res.status(500).json({ message: 'Login failed' });
//   }
// };



// optimized function 
exports.login = async (req, res) => {
  // console.log("FE se login call aa rha");
  try {
    const { email, password } = req.body;

    // Validate Required Fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required, please try again',
      });
    }

    // Find User by Email
    const user = await User.findOne({ email }).select('+password'); // Ensure password is selected explicitly
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User is not registered, please signup first',
      });
    }

    // Compare Passwords
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate Token
    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Clear Sensitive Data
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    // Set Cookie Options
    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    };

    // Send Response with Token
    return res
      .cookie('token', token, options)
      .status(200)
      .json({
        success: true,
        token,
        user: userWithoutPassword,
        message: 'User Login Success',
      });
  } catch (err) {
    console.error('Login Error:', err.message);
    return res.status(500).json({
      success: false,
      message: err.message || 'Login failed',
    });
  }
};


// ✅ Logout Controller
exports.logout = async (req, res) => {
  try {
    const token =  req.header('Authorization')?.replace("Bearer ", "") || req.cookies.token || req.body.token;
// console.log("token in logout", token)
      if (!token) {
          return res.status(401).json({
              success: false,
              message: 'No token provided. Please log in first.',
          });
      }
 // ✅ Clear token cookie
 res.clearCookie('token', {
  httpOnly: true,
  sameSite: 'None',
  secure: true, // Ensure secure flag is set for production (HTTPS)
});

      return res.status(200).json({
          success: true,
          message: 'Logout successful.',
      });
  } catch (error) {
      console.error('Logout Error:', error.message);
      return res.status(500).json({
          success: false,
          message: 'Failed to logout. Please try again later.',
      });
  }
};