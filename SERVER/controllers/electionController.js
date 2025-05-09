const HttpError = require("../models/ErrorModel");
const { v4: uuid } = require("uuid");
const cloudinary = require("../utils/cloudinary");
const path = require("path");
const fs = require("fs");
const ElectionModel = require("../models/electionModel");
const CandidateModel = require("../models/candidateModel");

const addElection = async (req, res, next) => {
    try {
        if(!req.user.isAdmin) {
            return next(new HttpError("Only an admin can perform this action.", 403))
        }

        const { title, description } = req.body;
        if (!title || !description) return next(new HttpError("Fill all fields.", 422));
        if (!req.files || !req.files.thumbnail) return next(new HttpError("Choose a thumbnail.", 422));

        const { thumbnail } = req.files;
        if (thumbnail.size > 1000000) return next(new HttpError("File size too big. Should be less than 1MB", 422));

        let fileName = thumbnail.name.split(".");
        fileName = fileName[0] + uuid() + "." + fileName[fileName.length - 1];

        const filePath = path.join(__dirname, "..", "uploads", fileName);
        await thumbnail.mv(filePath);

        const result = await cloudinary.uploader.upload(filePath, { resource_type: "image" });
        if (!result.secure_url) return next(new HttpError("Couldn't upload image to Cloudinary", 422));

        fs.unlinkSync(filePath); // Delete local file

        const newElection = await ElectionModel.create({ title, description, thumbnail: result.secure_url });
        res.status(201).json(newElection);
    } catch (error) {
        return next(new HttpError(error));
    }
};


const updateElection = async (req, res, next) => {
    try {
        if(!req.user.isAdmin) {
            return next(new HttpError("Only an admin can perform this action.", 403))
        }
    
        const { id } = req.params;
        const { title, description } = req.body;

        if (!title || !description) {
            return next(new HttpError("Fill in all fields.", 422));
        }

        const election = await ElectionModel.findById(id);
        if (!election) return next(new HttpError("Election not found.", 404));

        election.title = title;
        election.description = description;

        if (req.files && req.files.thumbnail) {
            const { thumbnail } = req.files;
            if (thumbnail.size > 1000000) {
                return next(new HttpError("File size too big. Should be less than 1MB", 422));
            }

            let fileName = thumbnail.name.split(".");
            fileName = fileName[0] + uuid() + "." + fileName[fileName.length - 1];

            const filePath = path.join(__dirname, "..", "uploads", fileName);
            await thumbnail.mv(filePath);

            const result = await cloudinary.uploader.upload(filePath, { resource_type: "image" });
            if (!result.secure_url) return next(new HttpError("Couldn't upload image to Cloudinary", 422));

            fs.unlinkSync(filePath);

            election.thumbnail = result.secure_url;
        }

        await election.save();
        res.status(200).json("Election updated successfully");

    } catch (error) {
        return next(new HttpError(error));
    }
};


const getElections = async (req, res, next) => {
    try {
        const elections = await ElectionModel.find();
        res.status(200).json(elections);
    } catch (error) {
        return next(new HttpError(error));
    }
};

const getElection = async (req, res, next) => {
    try {
        const { id } = req.params;
        const election = await ElectionModel.findById(id);
        if (!election) return next(new HttpError("Election not found.", 404));
        res.status(200).json(election);
    } catch (error) {
        return next(new HttpError(error));
    }
};

const getCandidatesOfElection = async (req, res, next) => {
    try {
        const { id } = req.params;
        const candidates = await CandidateModel.find({ election: id });
        res.status(200).json(candidates);
    } catch (error) {
        return next(new HttpError(error));
    }
};

const getElectionVoters = async (req, res, next) => {
    try {
        const { id } = req.params;
        const response = await ElectionModel.findById(id).populate("voters");
        if (!response) return next(new HttpError("Election not found.", 404));
        res.status(200).json(response.voters);
    } catch (error) {
        return next(new HttpError(error));
    }
};

const removeElection = async (req, res, next) => {
    try {
        if(!req.user.isAdmin){
            return next(new HttpError("Only an admin can perform this action.", 403))
        }

        const { id } = req.params;
        const deletedElection = await ElectionModel.findByIdAndDelete(id);
        if (!deletedElection) return next(new HttpError("Election not found.", 404));

        await CandidateModel.deleteMany({ election: id });
        res.status(200).json("Election deleted successfully.");
    } catch (error) {
        return next(new HttpError(error));
    }
};

module.exports = { 
    addElection, 
    getElections, 
    getElection, 
    updateElection, 
    removeElection, 
    getCandidatesOfElection, 
    getElectionVoters 
};