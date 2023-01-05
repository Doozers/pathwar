
from flask import Flask, render_template
import os

app = Flask(__name__, template_folder='template', static_folder='static')

passphrase = ""
with open("passphrase.txt", 'r') as file:
    passphrase = file.read()

flag = open('static/.f1d5027a3a0ca025c9832187a7dc2e46c3da975cb', 'w')
flag.write(passphrase)
flag.close()

@app.route('/')
def home():
    return render_template('index.php', xss='PoC')

if __name__ == "__main__":
    app.run(host='0.0.0.0')