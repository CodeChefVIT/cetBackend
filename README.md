<p align="center"><a href="https://www.codechefvit.com" target="_blank"><img src="https://s3.amazonaws.com/codechef_shared/sites/all/themes/abessive/logo-3.png" title="CodeChef-VIT" alt="Codechef-VIT"></a>
</p>

# Common Entry Test : Backend

> <Subtitle>
> One stop solution to make club and chapter recruitments in VIT simpler and hassle free.

---
[![API Docs ](https://img.shields.io/badge/API%20Docs-View%20Here-orange?style=flat-square&logo=appveyor)](https://documenter.getpostman.com/view/12931122/TVmPAxAf)

<p align="center">
<img src="https://i.ibb.co/VppxmWZ/cet.png" alt="Common-Entry-Test" width="250px"/>
</p>

## What is Common Entry Test ?
Common Entry Test is an assistive technology that helps make applying to clubs and chapters in VIT much easier and hassle free.

## Why Common Entry Test ?
1. No other system matches the diversity of clubs and chapters accessible through our portal. Explore and apply to clubs and chapters in VIT.
2. There is no need to repeat your applicant details for every club or chapter on your list. Enter your information one time and use it to apply to multiple clubs, teams and chapters.
3. Our system alerts you when important dates are approaching. Manage your deadlines and view application progress in one convenient dashboard.
4. Save time by reducing the time you spend on tedious recruitment tests by giving just one standardised test and spend it with your friends and enjoy college life.
5. Give a custom test by a club, team or chapter.
6. As an organisation, you don't need to spend resources and time trying to make your own portal. We do it for you.

## Features
1. Reduce redundancy.
2. Well updated and informative.
3. Easy to use.

## Important Links
- [CET Landing Page Repo](https://github.com/CodeChefVIT/Common-Entry-Test)
- [CET Landing Page](https://cet.codechefvit.com)
- [CET Frontend Repo](https://github.com/CodeChefVIT/cetFrontend)
- [CET Backend Repo](https://github.com/CodeChefVIT/cetBackend)
- [CET Frontend](https://cet-portal.codechefvit.com) 

## Instructions to Run 🛠️
```bash
$ git clone https://github.com/CodeChefVIT/cetBackend
$ cd cetBackend
$ npm install
```
- Add environmental variables in the `.env` file.
```bash
$ npx secure-env .env -s enimasinobhaniyo
$ npm run dev
```

## Environment Variables
| Variable              | Key                                    |
| --------------------- |:--------------------------------------:|
| NODE_ENV              | development                            |
| DBURI                 | <MongoDB_URI>                          |
| JWT_SECRET            | <Your_Secret_Key>                      |
| SENDGRID_API_KEY      | <Your_Sendgrid_API_Key>                |
| SENDGRID_EMAIL        | <Your_Sendgrid_Email>                  |
| RECAPTCHA_SECRET_KEY  | <Your_Recaptcha_Secret_Key>            |
| AWS_S3_BUCKET         | <Your_Bucket_Name>                     |
| AWS_ACCESS_KEY_ID     | <Your_AWS_Access_Key>                  |
| AWS_SECRET_ACCESS_KEY | <Your_AWS_Secret_Access_Key>           |
| AWS_DEFAULT_REGION    | <Your_AWS_Region>                      |
| CLIENT_ID             | <Your_Client_ID>                       |
| CLIENT_SECRET         | <Your_Client_Secret>                   |
| NODEMAILER_EMAIL      | <Your_Email_ID>                        |
| NODEMAILER_PASSWORD   | <Your_Email's_Password>                |


## Contributors
- <a href="https://github.com/RajatSablok">Rajat Sablok</a>
- <a href="https://github.com/jugaldb">Jugal Bhatt</a>
- <a href="https://github.com/N0v0cain3">Shivam Mehta</a>
- <a href="https://github.com/decipher07">Deepankar Jain</a>

## Contributing
Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are greatly appreciated. You can contribute to any of our issues given [here](https://github.com/CodeChefVIT/Common-Entry-Test/issues) or come up with any new feature requests.

## How to Contribute
1. Fork the Project
2. Create your Feature Branch 
3. Commit your Changes 
4. Push to the Branch 

## License
[![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://badges.mit-license.org)

<p align="center">
	With :heart: by <a href="https://www.codechefvit.com" target="_blank">CodeChef-VIT</a>
</p>
