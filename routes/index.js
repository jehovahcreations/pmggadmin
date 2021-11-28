var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Data = require('../models/data')
var xml = require('xml');
var builder = require('xmlbuilder');
fs = require('fs');
//var parser = require('xml2json');

router.get('/', (req, res) => {



    var xml1 = builder.create('RDService').att({ 'status': 'READY', 'info': 'Secure Mantra Authentication Vendor Device Manager' })
        //.ele('xmlbuilder')
        .ele('Interface', { 'id': 'DEVICEINFO', 'path': '/rd/info' })
        .up()
        .ele('Interface', { 'id': 'CAPTURE', 'path': '/rd/capture' })
        .end({ pretty: true });

    console.log(xml1);
    res.header('Access-Control-Allow-Methods', 'RDSERVICE')
    res.set('Content-Type', 'text/xml');
    res.status(200);
    res.send(xml1);
})



router.get('/register', function(req, res, next) {
    return res.render('index.ejs');
});

router.post('/search', (req, res) => {
    Data.findOne({ 'vid': req.body.search, 'sub': 1 }, (err, data3) => {
        //console.log(data.data);
        if (err) {
            res.json({ data1: "Nodata", msg: 'fail' });
        } else {
            if (data3 == null) {
                res.json({ data1: "Nodata", msg: 'fail' });
            } else {
                fs.writeFile('survey-fixed.xml', data3.data, function(err, data2) {
                    if (err) {
                        res.json({ data1: "Nodata", msg: 'fail' });
                    } else {
                        console.log(data3._id)
                        Data.updateOne({ '_id': data3._id }, { $set: { 'sub': 2 } }, (err, stat) => {
                            res.json({ data1: data3.name, msg: 'success' });
                        })


                    }
                });
            }

        }
    })

})


router.post('/register', function(req, res, next) {
    console.log(req.body);
    var personInfo = req.body;


    if (!personInfo.email || !personInfo.username || !personInfo.password || !personInfo.passwordConf) {
        res.send();
    } else {
        if (personInfo.password == personInfo.passwordConf) {

            User.findOne({ email: personInfo.email }, function(err, data) {
                if (!data) {
                    var c;
                    User.findOne({}, function(err, data) {

                        if (data) {
                            console.log("if");
                            c = data.unique_id + 1;
                        } else {
                            c = 1;
                        }

                        var newPerson = new User({
                            unique_id: c,
                            email: personInfo.email,
                            username: personInfo.username,
                            password: personInfo.password,
                            passwordConf: personInfo.passwordConf
                        });

                        newPerson.save(function(err, Person) {
                            if (err)
                                console.log(err);
                            else
                                console.log('Success');
                        });

                    }).sort({ _id: -1 }).limit(1);
                    res.send({ "Success": "You are regestered,You can login now." });
                } else {
                    res.send({ "Success": "Email is already used." });
                }

            });
        } else {
            res.send({ "Success": "password is not matched" });
        }
    }
});

router.get('/login', function(req, res, next) {
    return res.render('login.ejs');
});
// router.get('/tabledata', function(req, res, next) {
//     return res.render('table.ejs');
// });

router.get('/tabledata', (req, res) => {
    User.find({}, (err, user) => {
        if (err) {
            console.log(err);
        } else {
            console.log(user)
            res.render('table', { title: 'User List', userData: user });
        }
    })
})

router.post('/login', function(req, res, next) {
    //console.log(req.body);
    User.findOne({ email: req.body.email }, function(err, data) {
        if (data) {

            if (data.password == req.body.password) {
                //console.log("Done Login");
                if (data.admin == "1") {
                    req.session.userId = data.unique_id;
                    //console.log(req.session.userId);

                    res.send({ "Success": "Success!" });
                }

            } else {
                res.send({ "Success": "Wrong password!" });
            }
        } else {
            res.send({ "Success": "This Email Is not regestered!" });
        }
    });
});
router.get('/rd/capture', (req, res) => {
    // var xml1 = builder.create('PidData')


    // .ele('Resp', { 'errCode':'0','errInfo':'Success','fCount':'1','fType':'0','nmPoints':'40','qScore':'71' })
    // .up()
    //  .ele('DeviceInfo', {'dpId':'MANTRA.MSIPL','rdsId':'MANTRA.WIN.001','rdsVer':'1.0.3','mi':'MFS100','mc':'MIIEGDCCAwCgAwIBAgIEAJiWgDANBgkqhkiG9w0BAQsFADCB6jEqMCgGA1UEAxMhRFMgTWFudHJhIFNvZnRlY2ggSW5kaWEgUHZ0IEx0ZCA3MUMwQQYDVQQzEzpCIDIwMyBTaGFwYXRoIEhleGEgb3Bwb3NpdGUgR3VqYXJhdCBIaWdoIENvdXJ0IFMgRyBIaWdod2F5MRIwEAYDVQQJEwlBaG1lZGFiYWQxEDAOBgNVBAgTB0d1amFyYXQxHTAbBgNVBAsTFFRlY2huaWNhbCBEZXBhcnRtZW50MSUwIwYDVQQKExxNYW50cmEgU29mdGVjaCBJbmRpYSBQdnQgTHRkMQswCQYDVQQGEwJJTjAeFw0yMTEwMTUxOTE5MTJaFw0yMTExMTQxOTM0MTBaMIGwMSUwIwYDVQQDExxNYW50cmEgU29mdGVjaCBJbmRpYSBQdnQgTHRkMR4wHAYDVQQLExVCaW9tZXRyaWMgTWFudWZhY3R1cmUxDjAMBgNVBAoTBU1TSVBMMRIwEAYDVQQHEwlBSE1FREFCQUQxEDAOBgNVBAgTB0dVSkFSQVQxCzAJBgNVBAYTAklOMSQwIgYJKoZIhvcNAQkBFhVzdXBwb3J0QG1hbnRyYXRlYy5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDZxQ+b/+6PuvoLt0gdP+pmuqTCyp+UeWAdTnk2u4RTqTLzLwA8IWyyJCZVTjcqITOqi4l7gl/wWAEg/V0xtg4ySoSZKPxu8hnLLvdXUxaF+Zu0SqzXuIjyNBDjColJ6Hua0v3bHsfIb5Gm8EIgStw0OR1aIR61yB+uIjSnsRdHHkAj8cgfyElX03QIdDbhg5vQNSmiYUKEj1abIwgiii+PcNOXNY0kjS1wlxr3Mni2KraBnbXpByEyVQvAJORzI4DQN/5zQNyBKB59iDw29lLxzOQoWUT8I9QfbPY7zk/XLW8ETQNKdr6H6kOebJB9X/bQRrswFbAw+6kk6u+Y4ezzAgMBAAEwDQYJKoZIhvcNAQELBQADggEBAAuRpF8scQ+nwoWlYiw6uAXMSpQgrMMO9LQwYZ+5rv0B8+Ftucr7epDniyqZygWY/JEr5rvHhQ6PcB1SnUCkXdwZL4M+FK6u/+di3Mtu2ZiuIRfmp4lmaO5++ksNeLm6dYNQvrrZXjodQry191mMbx6GMcIXIHE9YuuVMWyD+SvQ0jbjDQtf/o6UW8zfxTEnsWrytyG6zX7egvxc1flgOLiAsDFVa2KuvJM+BpIGErUgx4vg/JpQy0s0sknOJictCFGnhnd8FdaLo/ZwLdapnTZKvTyh+btIdd9crDxbUVFuNx6/A81mc/bPEexsMVOwfrjp8ah1PmWYcUv8DdxuLX0=','dc':'d988d827-aefc-49b9-bfbe-9191029d2fe1'})
    //  .ele('additional_info')
    //   //builder.create('Param').att('name', 'srno')
    //  .ele('Param')

    //  .att({'name':'srno','value':'4201609'})
    //  .up()
    //  .ele('Param')
    //  .att({'name':'sysid','value':'6A9FEBFEC50A6F3FBFF0'})
    //  .up()
    //  .ele('Param')
    //  .att({'name':'ts','value':'2021-10-20T19:14:23+05:30'})
    //  .up()  
    //  .up()  
    //  .up()  
    // // .ele('Param',{'name':'sysid','value':'6A9FEBFEC50A6F3FBFF0'})
    // // .up()
    // // .ele('Param',{'name':'ts','value':'2021-10-17T00:26:01+05:30'})

    //  .ele('Skey', {'ci':'20221021'},'MlLWXdFm08SahneAUdkm4W4UxSQerB5wAMnkbQX1yv4jfy/81CPbSAplseBzrhNpXzYvBr/mlVkc6DcBQ1hzIfMauXDC0lha/UeWQa+BkdGVx1wSZdKyFkpkHURptkdrG329vt6LKkFVqV/flBdnpYmGD3aQ2IUqax/s3stPZBKzTU/Qgwr0fFtzZ0Sdz3dIYiuYx7RzjDu/QAzCEOxEqUt4NIHioU/2FnVrb+MYbQJt+8HVFu/BrPRTueQwpO/1VBCy3qOHJ7sf3/+OcxMvJ8pwCo9YmE32Unba0VqMPDBLKAGEzVXzcz1fGh4fYRhjJnxoNkerYQpdU6GKy8D6Ig==').up()
    //  .ele('Hmac','5BF0x+mHVQd3E5HfLRKYUl90468+WMB1M0jw7XsgaOQPaMewDPL1165U1oqQn6eW').up()
    //  .ele('Data', {'type':'X'}, 'MjAyMS0xMC0yMFQxOToxNDoyM3fnTptkUIrON1go6etDZ4MbryUqJu8WpTG5cDhdkJCZUJcZGwKjOnDqpC8lZfmnHDVQU/uAsXQNvqzf79hqAAZ1PHPuDPEzGyHHjq4ljRrJ6xwosUX/Gu7T0+L9A44YzfJNG0daR7rGGfSwqLWxs/EE35IUu7K7446k6y8MlnIgg6MqGxyiruSsqUcXACmS20xM+WYsx7JJjxLGxNP5WRpGU/a2ycaP7sbkRa9q7tHRx0DPLkMHV8xpaLve+cUycOr8kYAy010R3DfOLgCOhv+5ui7tUAUngHeh1NLySRpPKr6dcuIljmp6sPDyKo8mXFxzTWOhYzNGjfpFwiys/S4BY/T9Fn4nUQPXJdwIot6EmPkGbcMcuhjRG/hUczrQ/IkBcAi7EAgWtWn/umXhZKRLIkqYqrpR0Z6chDcALFzh0VaGs9pv0QFJQDgB5jih7fWDa6XEBUbd4W8BlxAb4IEGkWwCjYybfMn7aw7hXd5BJbayfK5Ldz7qYMI5CD9A1th+RIugyKkFmaglPZqiHMzD/0fqkYd2VI1dO+arPebRgTQIZ9sA3lb8igyYgGQwZ6YPeebqwHFNnRyNi9TGfVlwhbqtWmb82AZVC87snnDnjwOLzd7+s9aOC3aGLEjmefqgxEXgAbk3VtfKOXiPvEKZxRM6AV0ks3Wv7PIadvohmhOXoP+l5TGZnuXFIKZXuyvhbxIZCdsrQCOLPzBdH9mJ3z/2xhIIEAqnrQpXQEyZgl6B4+uIfWDm3P06Hp4/sfrI8poLuc/gpq8EXf93tsaIgDJf6tR10xcQ6dct+5znjhsxG2wOpIzHJfQsbAfWpziczyt3dWQcUKHayriHoTY7W3tZ4rJNPGCeXtjyf0eQAQaX2G6Sl/hJAlLxThhzewwQm8I6sRsdrbUHs/+cMV2XPMMs6pKZjwzmAQA1TPunqDyLMBOmfSCrS7kVA7MczkPzw09b57ajCxk4nZ2BS3vhthl/lB0XvMIKvmzcZMhpA47djAUpblzWFxrE17kLmvqqZ97cjtwvLgpmux9GgLqOnfiGOlCRi+hInaEdtmOIp8M/hdSLbyvZBU1g5JJoXtqlGIsrH5XuLIM0jFBSASOh6DLqWsG8AZZPZqVNKHvoiExJARS4UuJHMgVp/ImtFlQUZMRDvd+OJNka/A0BZiO6s0uwZ/BjNSnaWxQmyg==')
    //  .up()
    //  .end({ pretty: true});
    fs.readFile('./survey-fixed.xml', function(err, data) {
        //  console.log(data);
        res.header('Access-Control-Allow-Methods', 'CAPTURE')
        res.set('Content-Type', 'text/xml');
        res.status(200);
        res.send(data);

    });

    // console.log(xml1);
    // res.header('Access-Control-Allow-Methods', 'CAPTURE')
    // res.set('Content-Type', 'text/xml');
    // res.status(200);
    // res.send(xml1);
})
router.post('/window', (req, res) => {
    var data = new Data({
        name: req.body.name,
        vid: req.body.vid,
        gender: req.body.gender,
        dob: req.body.dob,
        data: req.body.data
    })
    data.save();
    console.log('saved');
    res.send('Success');
})

router.get('/profile', function(req, res, next) {
    console.log("profile");
    User.findOne({ unique_id: req.session.userId }, function(err, data) {
        console.log("data");
        console.log(data);
        if (!data) {
            res.redirect('/');
        } else {
            //console.log("found");

            return res.render('data.ejs', { "name": data.username, "email": data.email });
        }
    });
});

router.get('/logout', function(req, res, next) {
    console.log("logout")
    if (req.session) {
        // delete session object
        req.session.destroy(function(err) {
            if (err) {
                return next(err);
            } else {
                return res.redirect('/login');
            }
        });
    }
});

router.get('/forgetpass', function(req, res, next) {
    res.render("forget.ejs");
});

router.post('/forgetpass', function(req, res, next) {
    //console.log('req.body');
    //console.log(req.body);
    User.findOne({ email: req.body.email }, function(err, data) {
        console.log(data);
        if (!data) {
            res.send({ "Success": "This Email Is not regestered!" });
        } else {
            // res.send({"Success":"Success!"});
            if (req.body.password == req.body.passwordConf) {
                data.password = req.body.password;
                data.passwordConf = req.body.passwordConf;

                data.save(function(err, Person) {
                    if (err)
                        console.log(err);
                    else
                        console.log('Success');
                    res.send({ "Success": "Password changed!" });
                });
            } else {
                res.send({ "Success": "Password does not matched! Both Password should be same." });
            }
        }
    });

});

module.exports = router;