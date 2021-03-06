import jwt from 'jsonwebtoken';
import User from '../../../../models/user';

export const generateToken = (user) => {
  const { _id, username, email, placeholderColor, discriminator, profilePic, isPro, remainingBytes, remainingFiles, remainingTransfers, role } = user;
  return jwt.sign({ id: _id, username, email, placeholderColor, discriminator, profilePic, isPro, remainingBytes, remainingFiles, remainingTransfers, role }, process.env.JWT_SECRET);
}

const saveUser = (user) => new Promise((resolve, reject) => {
  user.save(error => {
    if (error) reject(error);
    resolve();
  });
})

const findUser = (userId) => new Promise((resolve, reject) => {
  User
    .findOne({ _id: userId })
    .populate('friends')
    .exec((error, user) => {
      if (error) reject(error);
      resolve(user);
    });
})

const validateOptions = (options) => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.body) throw new Error('options.body is required.');
    if (!options.params) throw new Error('options.params is required.');
    if (!options.params.userId) throw new Error('options.params.userId is required.');
    if (!options.response) throw new Error('options.response is required.');
  } catch (exception) {
    throw new Error(`[updateUser.validateOptions] ${exception.message}`);
  }
}

const updateUser = async ({ body, params }, response) => {
  try {
    const { userId } = params;
    validateOptions({ body, params, response });

    let user = await findUser(userId);

    if (body['remainingFiles'] >= 3 && !user.isPro) body['remainingFiles'] = 3;

    for (const key of Object.keys(body)) {
      if (user[key] !== undefined) {
        user[key] = body[key];
      }
    }

    await saveUser(user);
    const token = generateToken(user);

    response.status(200).send({ token });
  } catch(exception) {
    response.status(500).send({ message: exception.message });
    throw new Error(`[updateUser] ${exception.message}`);
  }
}

export default updateUser;
