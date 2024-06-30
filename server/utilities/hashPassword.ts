import bcrypt from 'bcrypt';
export const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(password, salt);
};

export const comparePassword = async (password, dbPassword) => {
    return await bcrypt.compare(password, dbPassword);
};
