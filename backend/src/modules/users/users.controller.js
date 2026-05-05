const userService = require("./users.service");
const { createUserSchema } = require("./users.validation");

const createUser = async (req, res, next) => {
    try {

        const { error } = createUserSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const user = await userService.createUser(
            req.body,
            req.user.id   // 👈 AQUÍ se envía el usuario que hizo la acción
        );

        res.status(201).json({
            success: true,
            user
        });

    } catch (error) {
        next(error);
    }
};
module.exports = {
    createUser
};