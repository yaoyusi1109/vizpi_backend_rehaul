const bcrypt = require('bcrypt')
const sequelize = require("../postgre/db")
const initModels = require("../models/init-models")
const Instructor = initModels(sequelize).instructor
const User = initModels(sequelize).user
const Session = initModels(sequelize).session
const Op = require('sequelize').Op;
const { getUserByEmail } = require('../services/userService')
var CryptoJS = require("crypto-js");
var iv  = CryptoJS.enc.Utf8.parse('1583288699248111');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail  } = require('firebase/auth')
const {initializeApp} = require('firebase/app')
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "fir-app-43910.firebaseapp.com",
  projectId: "fir-app-43910",
  storageBucket: "fir-app-43910.appspot.com",
  messagingSenderId: "315759499220",
  appId: "1:315759499220:web:5a0c91d03fce432427a841",
  measurementId: "G-LCS169YG7Z"
};
console.log(process.env.REACT_APP_FIREBASE_API_KEY)
// Initialize Firebase
const firApp = initializeApp(firebaseConfig);
const auth = getAuth(firApp);

async function hashPassword (password) {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

function decrypt(value) {
  try {
		const decrypted = CryptoJS.AES.decrypt(value, process.env.JWT_SECRET);
		if (decrypted) {
			try {
				const str = decrypted.toString(CryptoJS.enc.Utf8);
				if (str.length > 0) {
					return str
				} else {
					return 'error 1';
				} 
			} catch (e) {
				return 'error 2';
			}
		}
		return 'error 3';
	} catch (err) {
		console.error("Error retrieving users by group:", err);
	}
}

async function validatePassword (email, plainPassword) {
  const instructor = await Instructor.findOne({ where: { email: email } })
  if(!instructor){
    const students = await User.findAll({ where: {email: {[Op.ne]: null}}})
    let student = students.find((element) => decrypt(element.email)===email);
    console.log(student)
    const hashedPassword = student.password
    const isValid = await bcrypt.compare(plainPassword, hashedPassword)
    console.log(isValid)
    if (isValid) {
      signInWithEmailAndPassword(auth, email, plainPassword)
        .then((userCredential) => {
          // Signed in 
          const user = userCredential.user;
          // ...
          console.log(user)
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(error)
        });
      const studentWithoutPassword = { ...student.toJSON() }
      delete studentWithoutPassword.password
      return studentWithoutPassword
    } else {
      return await signInWithEmailAndPassword(auth, email, plainPassword)
        .then((userCredential) => {
          // Signed in 
          const user = userCredential.user;
          console.log(userCredential)
          hashPassword(plainPassword).then((hashedPass)=>{
            student.password = hashedPass
            student.save()
            const studentWithoutPassword = { ...student.toJSON() }
            delete studentWithoutPassword.password
            return studentWithoutPassword
          })
          
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
        });
    }
  }
  const hashedPassword = instructor.password
  const isValid = await bcrypt.compare(plainPassword, hashedPassword)
  if (isValid) {
    const instructorWithoutPassword = { ...instructor.toJSON() }
    delete instructorWithoutPassword.password
    return instructorWithoutPassword
  } else {
    return null
  }
}

async function register (instructor) {
  instructor.password = await hashPassword(instructor.password)
  try {
    const res = await Instructor.create(instructor)
    return res
  } catch (error) {
    throw new Error(error)
  }
}
async function registerStudent (student) {
  const email = student.email
  const encryptEmail = CryptoJS.AES.encrypt(email, process.env.JWT_SECRET).toString();
  const password = student.password
  let prior = await getUserByEmail(student.email)
  console.log(prior)
  if(prior != null){
    return "Account with this email already exists"
  }
  student.password = await hashPassword(student.password)
  try {
    student.email = encryptEmail
    const res = await sequelize.transaction(async (t) => {
			const user = await User.create(student, { transaction: t })
			await Session.increment("stu_num", {
				where: {
					id: student.session_id,
				},
				transaction: t,
			})
			return user
		})
    
    return await createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed up 
        const user = userCredential.user;
        // ...
        console.log(res)
        return res
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
        console.log(error)
        return res
      });
  } catch (error) {
    throw new Error(error)
  }
}

async function recover (email) {
  console.log(email)
  sendPasswordResetEmail(auth, email)
  .then(() => {
    // Password reset email sent!
    // ..
    console.log("all good!")
    return true
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log("not good")
    console.log(error)
    return false
  });

}

// function login (req, res, next) {
//   passport.authenticate('local', (err, user, info) => {
//     if (err) {
//       return next(err)
//     }
//     if (!user) {
//       return res.status(400).send(info.message)
//     }
//     req.logIn(user, (err) => {
//       if (err) {
//         return next(err)
//       }
//       return res.redirect('/dashboard')
//     })
//   })(req, res, next)
// }

function logout (req, res) {
  req.logout()
}

module.exports = {
  hashPassword,
  validatePassword,
  register,
  registerStudent,
  recover,
  logout
}
