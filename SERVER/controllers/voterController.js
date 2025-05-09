const bcrypt =  require("bcryptjs")
const jwt = require('jsonwebtoken')

const HttpError = require('../models/ErrorModel');
const voterModel = require('../models/voterModel');

const registerVoter = async (req, res, next) => {
    try {
        const {fullName, email, password, password2} = req.body;
        if(!fullName || !email || !password || !password2) {
            return next(new HttpError("Fill in all fields.",422))
        }
        const newEmail = email.toLowerCase();
        const emailExists = await voterModel.findOne({email: newEmail})
        if(emailExists) {
            return next(new HttpError("Email exist.",422))
        }

        if((password.trim().length) < 6) {
            return next(new HttpError("Password should be at least 6 characters.",422))
        }

        if(password != password2) {
            return next(new HttpError("Passwords do not match.",422))
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        let isAdmin = false;
        if(newEmail == "admin@gmail.com") {
            isAdmin = true
        }
        const newVoter = await voterModel.create({fullName, email: newEmail,password: hashedPassword, isAdmin})
        res.status(201).json(`New Voter ${fullName} created.`)
    } catch (error) {
        return next(new HttpError("Voter registration failed.",422))
    }
}






const generateToken = (payload) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "24h"})  // Changed from "id" to "24h"
    return token;
}

const loginVoter = async (req, res, next) => {
    try{
        const {email, password} = req.body;
        if(!email || !password) {
            return next(new HttpError("Fill in all fields.", 422))
        }
        const newEmail = email.toLowerCase()
        const voter = await voterModel.findOne({email: newEmail})
        if(!voter) {
            return next(new HttpError("Invalid credentials.", 422))
        }
        const comparePass =await bcrypt.compare(password, voter.password)
        if(!comparePass) {
            return next(new HttpError("Invalid credentials.",422))
        }
        const { _id: id, isAdmin, votedElections} = voter;
        const token = generateToken({id, isAdmin})

        res.json({token, id, votedElections, isAdmin})
    }catch (error) {
            return next(new HttpError("Login failed. Please check your credentials or try again later.", 422))
        }
}

const getVoter = async (req, res, next) => {
    try {
        const election = await ElectionModel.findById(req.params.id).populate({
            path: "voters",
            select: "fullName email votedAt",
        });

        if (!election) {
            return next(new HttpError("Election not found.", 404));
        }

        res.json(election.voters);
    } catch (error) {
        return next(new HttpError(error));
    }
};


module.exports = {registerVoter, loginVoter, getVoter}