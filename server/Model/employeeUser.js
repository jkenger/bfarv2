const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')

const UserSchema = mongoose.Schema({
    email: {
        type: String,
        required: [true, "Please enter an email."],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Invalid email"]
    },

    password: {
        type: String,
        required: [true, "Invalid password"],
        minLength: [6, "Minimum length of 6"]
    },

    role: {
        type: String,
        lowercase: true,
        default: "employee"
    },
    emp_code:{
        type: String,
        required: [true, "Employee code is required"],
    }
})

UserSchema.pre('save', async function(){
    const salt = await bcrypt.genSalt()
    this.password = await bcrypt.hash(this.password, salt)
})

UserSchema.statics.login = async function(email, password){
    // find user if exist
    const user = await this.findOne({email})

    if(!user) throw Error('Invalid email') 
    if(user){
        // authenticate
        const auth = await bcrypt.compare(password, user.password)
        if(auth){ return user }
        throw Error('Invalid password')
    }
}

const EmployeeUsers = mongoose.model('EmployeeUsers', UserSchema)

module.exports = EmployeeUsers