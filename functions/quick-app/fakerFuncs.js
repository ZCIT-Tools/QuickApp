const { faker } = require('@faker-js/faker/locale/en_US');

exports.createRandomUser = async () => {
    const sex = faker.name.sexType();
    const firstName = faker.name.firstName(sex);
    const lastName = faker.name.lastName();
    return {
        avatar: faker.image.avatar(),
        birthday: faker.date.birthdate(),
        email: faker.internet.email(firstName, lastName),
        firstName,
        lastName,
        sex
    }
}

exports.createRandomAddress = async () => {

}
