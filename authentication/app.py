from flask import Flask, request, jsonify

app = Flask(__name__)

users = {
    'admin': 'password123'
}

@app.route('/auth', methods=['POST'])
def auth():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if users.get(username) == password:
        return jsonify({'authenticated': True})
    else:
        return jsonify({'authenticated': False})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
