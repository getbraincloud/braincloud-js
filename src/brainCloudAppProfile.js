// Request signer for an app; a function is used as-is.
function brainCloudAppProfile(value)
{
    if (typeof value === "function")
    {
        return value;
    }

    var bytes = brainCloudUtf8(value == null ? "" : String(value));
    var a = [];
    var b = [];
    var c = typeof crypto !== "undefined" && crypto && typeof crypto.getRandomValues === "function";
    var r0 = c ? crypto.getRandomValues(new Uint8Array(bytes.length)) : null;
    for (var i = 0; i < bytes.length; i++)
    {
        var r = r0 ? r0[i] : Math.floor(Math.random() * 256);
        a.push(r);
        b.push(bytes[i] ^ r);
        bytes[i] = 0;
    }

    return function (payload)
    {
        var n = a.length;
        var words = [];
        for (var j = 0; j < n; j++)
        {
            words[j >>> 2] |= (a[j] ^ b[j]) << (24 - (j % 4) * 8);
        }
        var hasher = CryptoJS.algo.MD5.create();
        hasher.update(payload);
        hasher.update(CryptoJS.lib.WordArray.create(words, n));
        var signature = hasher.finalize().toString();
        for (j = 0; j < words.length; j++)
        {
            words[j] = 0;
        }
        return signature;
    };
}

function brainCloudUtf8(str)
{
    var out = [];
    for (var i = 0; i < str.length; i++)
    {
        var c = str.charCodeAt(i);
        if (c >= 0xd800 && c < 0xdc00 && i + 1 < str.length)
        {
            var n = str.charCodeAt(i + 1);
            if (n >= 0xdc00 && n < 0xe000)
            {
                c = 0x10000 + ((c - 0xd800) << 10) + (n - 0xdc00);
                i++;
            }
        }
        if (c < 0x80) out.push(c);
        else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
        else if (c < 0x10000) out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
        else out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    }
    return out;
}
