function getLocalData(defaultValue) {
    let storage = window.localStorage;
    let data = storage.getItem("user-data");
    if (data == undefined) return defaultValue;
    return JSON.parse(data);
}



function PasswordManager(password) {
    this.cryptoHelper = new CryptoHelper(password);
    this.data = getLocalData([]);
    return this;
}


// devo farlo perché costruttore non può essere asincrono
PasswordManager.newInstance = async function(password) {
    valid = await CryptoHelper.isValidPassword(password)
    if(!valid)
        throw 'Password non corretta';
    return new PasswordManager(password);
}
PasswordManager.init = async function(password) {
    await CryptoHelper.init(password);
    return await PasswordManager.newInstance(password);
}

PasswordManager.prototype.storeCredentials = async function (
    name,
    username,
    password
) {
    let storage = window.localStorage;
    let encryptedPassword = await this.cryptoHelper.encrypt(password);
    this.data.push({
        name: name,
        username: username,
        password: encryptedPassword,
    });
    storage.setItem("user-data", JSON.stringify(this.data));
};

PasswordManager.prototype.getCredentials = function () {
    return this.data;
};

PasswordManager.prototype.getPlaintextPassword = async function (
    encryptedPassword
) {
    return await this.cryptoHelper.decrypt(encryptedPassword);
};

PasswordManager.prototype.deleteCredentials = function (credentials) {
    this.data = this.data.filter(el => credentials != el);
    window.localStorage.setItem("user-data", JSON.stringify(this.data));
}


PasswordManager.exportConfig = function () {
    let storage = window.localStorage;
    let exportObj = {
        iv :  storage.getItem("iv"),
        salt : storage.getItem("salt"),
        hash : storage.getItem("hash"),
        data : JSON.parse(storage.getItem("user-data"))
    };
    return exportObj;
}

PasswordManager.importConfig = function(obj) {
    let storage = window.localStorage;
    storage.setItem("iv",obj.iv);
    storage.setItem("salt",obj.salt);
    storage.setItem("hash",obj.hash);
    storage.setItem("user-data",JSON.stringify(obj.data));
}
