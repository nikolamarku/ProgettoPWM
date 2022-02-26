function importKey(text) {
    let enc = new TextEncoder();
    return window.crypto.subtle.importKey(
        "raw",
        enc.encode(text),
        "PBKDF2",
        false,
        ["deriveBits", "deriveKey"]
    );
}

function getAESKey(importedKey, salt) {
    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256",
        },
        importedKey,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
}

async function encrypt(key, iv, input) {
    let encodedInput = new TextEncoder().encode(input);
    return await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        key,
        encodedInput
    );
}

async function decrypt(ciphertext, iv, key) {
    try {
        let plaintext = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv,
            },
            key,
            ciphertext
        );
        return new TextDecoder().decode(plaintext);
    } catch (e) {
        console.log(e);
        throw "Chiave non corretta o errore di cifratura";
    }
}

const getUint8ArrayFromLocalStorage = (key) => {
    let item = window.localStorage.getItem(key);
    return base64toArr(item);
};

function CryptoHelper(password) {

    let params = {
        salt: getUint8ArrayFromLocalStorage("salt"),
        iv: getUint8ArrayFromLocalStorage("iv")
    };

    //usamo chiusura per nascondere la password
    return {

        //parametro: stringa in chiaro
        //return: ct in base64
        encrypt: async (plaintext) =>  {
            let importedKey = await importKey(password);
            let aesKey = await getAESKey(importedKey, params.salt);
            let arrayBuffer = await encrypt(aesKey, params.iv, plaintext);
            return arrToBase64(new Uint8Array(arrayBuffer));
        },

        //Parametro: ct in base64
        //Return: stringa in chiaro
        decrypt: async (ciphertext) => {
            let importedKey = await importKey(password);
            let aesKey = await getAESKey(importedKey, params.salt);
            return await decrypt(base64toArr(ciphertext), params.iv, aesKey);
        }
    };
}

async function hash(message) {
    const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgUint8); // hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
    const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""); // convert bytes to hex string
    return hashHex;
}

CryptoHelper.init = async function (password) {
    let hashedPassword = await hash(password);
    let salt = window.crypto.getRandomValues(new Uint8Array(16));
    let iv = window.crypto.getRandomValues(new Uint8Array(12));
    window.localStorage.setItem("hash", hashedPassword);
    window.localStorage.setItem("salt", arrToBase64(salt));
    window.localStorage.setItem("iv", arrToBase64(iv));
};



CryptoHelper.importConfig = function (hashedPassword, saltB64, ivB64) {
    window.localStorage.setItem("hash", hashedPassword);
    window.localStorage.setItem("salt", saltB64);
    window.localStorage.setItem("iv", ivB64)
}

CryptoHelper.isValidPassword = async function (password) {
    let hashedPassword = await hash(password);
    return hashedPassword === window.localStorage.getItem("hash")
}
