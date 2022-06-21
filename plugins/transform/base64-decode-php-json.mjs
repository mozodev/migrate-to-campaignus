import fs from 'fs'
import {unserialize} from 'php-serialize'

let originText = fs.readFileSync('./6584-project.txt', 'utf8')

// Base64 Decoding
let base64DecodedText = Buffer.from(originText, "base64").toString('utf8');
let data = unserialize(base64DecodedText)
console.log(typeof data)
fs.writeFileSync('./6584-project.json', JSON.stringify(data));
