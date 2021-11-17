# twilio-video
このリポジトリは[flask-twilio-video](https://github.com/miguelgrinberg/flask-twilio-video)を参考に作られています．

# 実行方法
1. [Twilioアカウントを作成します．](https://www.twilio.com/blog/how-to-create-twilio-account-jp)
2. このリポジトリをcloneします
3. [必要となるAPI Keyを準備します](https://www.twilio.com/console/project/api-keys)
4. virtualenvを作成し，依存関係を`pip install -r requirements.txt`でインストールします．
5. `.env.template`を`.env`へ名前を変更し，3で作成したAPI Keyの情報を記載します．
6. `flask run`で実行し，`localhost:5000`へアクセスします．