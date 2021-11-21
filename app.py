import os
from datetime import date, datetime, timedelta
from dotenv import load_dotenv
from flask import Flask, render_template, request, abort
from twilio.jwt.access_token import AccessToken
from twilio.jwt.access_token.grants import VideoGrant
from flask.json import JSONEncoder

load_dotenv()
twilio_account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
twilio_api_key_sid = os.environ.get('TWILIO_API_KEY_SID')
twilio_api_key_secret = os.environ.get('TWILIO_API_KEY_SECRET')

# timedeltaをJSONで出力できるようにする
class CustomJSONEncoder(JSONEncoder):
    def default(self, obj):
        try:
            if isinstance(obj, 
             timedelta):
                return obj.seconds
            iterable = iter(obj)
        except TypeError:
            pass
        else:
            return list(iterable)
        return JSONEncoder.default(self, obj)


app = Flask(__name__)
app.json_encoder = CustomJSONEncoder
speakMap = dict()
lastDominantSpeakerChanged = None
lastSpeaker = None
@app.route('/')
def index():
    return render_template('index.html')


@app.route('/login', methods=['POST'])
def login():
    username = request.get_json(force=True).get('username')
    if not username:
        abort(401)

    token = AccessToken(twilio_account_sid, twilio_api_key_sid,
                        twilio_api_key_secret, identity=username)
    token.add_grant(VideoGrant(room='My Room'))
    return {'token': token.to_jwt().decode()}

@app.route('/speaks', methods=['POST'])
def saveSpeak():
    global lastDominantSpeakerChanged
    global lastSpeaker
    username = request.get_json(force=True).get('username')
    if not username:
        abort(400)
    # lastSpeakerがいない = 初めての発言者なので，登録だけして終わる
    if not lastSpeaker:
        lastSpeaker = username
        lastDominantSpeakerChanged = datetime.now()
        return {'status': 'ok'}

    now = datetime.now()
    duration =  now - lastDominantSpeakerChanged
    print(duration)

    if lastSpeaker in speakMap:
        speakMap[lastSpeaker] += duration
    else:
        speakMap[lastSpeaker] = duration
    lastDominantSpeakerChanged = now
    lastSpeaker = username
    return {'status': 'ok'}

@app.route('/speaks', methods=['GET'])
def getSpeaks():
    return {'speaks': speakMap}
