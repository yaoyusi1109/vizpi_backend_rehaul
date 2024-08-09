const sequelize = require("../postgre/db");
const initModels = require("../models/init-models");
const { Op } = require("sequelize");
const group = require("../models/group");

const User = initModels(sequelize).user;
const Code = initModels(sequelize).code;
const Group = initModels(sequelize).group;
var CryptoJS = require("crypto-js");
var iv  = CryptoJS.enc.Utf8.parse('1583288699248111');
const { getGroupById } = require("./groupService")

exports.list = async () => {
	try {
		return await User.findAll();
	} catch (err) {
		console.log(err);
	}
};

exports.getUserById = async (id) => {
	try {
		return await User.findByPk(id);
	} catch (err) {
		console.log(err);
	}
};

exports.getUsersByIds = async (ids) => {
	try {
		return await User.findAll({
			where: {
				id: {
					[Op.in]: ids,
				},
			},
		});
	} catch (err) {
		console.log(err);
	}
};

exports.createUser = async (user) => {
	try {
		return await User.create(user);
	} catch (err) {
		console.log(err);
	}
};

exports.updateUser = async (user) => {
	try {
		return await User.update(user, {
			where: {
				id: user.id,
			},
		});
	} catch (err) {
		console.log(err);
	}
};

exports.deleteUser = async (id) => {
	try {
		return await User.destroy({
			where: {
				id: id,
			},
		});
	} catch (err) {
		console.log(err);
	}
};

exports.getCodes = async (userId) => {
	try {
		return await Code.findAll({
			where: {
				creator_id: userId,
			},
		});
	} catch (err) {
		console.log(err);
	}
};

exports.getGroup = async (userId) => {
	try {
		const user = await User.findByPk(userId);
		const group = await Group.findByPk(user.group_id);
		return group;
	} catch (err) {
		console.log(err);
	}
};

exports.getUsersBySessionId = async (sessionId) => {
	try {
		return await User.findAll({
			where: {
				session_id: sessionId,
			},
		});
	} catch (err) {
		console.log(err);
	}
};

exports.getUsersByGroup = async (groupId) => {
	try {
		const group = await getGroupById(groupId);
		if (!group) throw new Error("Group not found");
		return await User.findAll({
			where: {
				id: {
					[Op.in]: group.user_ids,
				},
			},
		});
	} catch (err) {
		console.error("Error retrieving users by group:", err);
	}
};


exports.getUserByEmail = async (email) => {
	console.log(email)
	const encryptEmail = CryptoJS.AES.encrypt(email, process.env.JWT_SECRET).toString();
	try {
		let user = await User.findOne({
			where:{
				email: encryptEmail,
			}
		})
		return user
	} catch (err) {
		console.error("Error retrieving users by group:", err);
	}
};


exports.decryptUserEmail = async (id) => {
	try {
		let user = await getUserById(id)
		const decrypted = CryptoJS.AES.decrypt(user.email, process.env.JWT_SECRET);
		if (decrypted) {
			try {
				console.log(decrypted);
				const str = decrypted.toString(CryptoJS.enc.Utf8);
				console.log(str)
				if (str.length > 0) {
					user.email = str
					return user;
				} else {
					return 'error 1';
				} 
			} catch (e) {
				return 'error 2';
			}
		}
		return 'error 3';
		return user
	} catch (err) {
		console.error("Error retrieving users by group:", err);
	}
};