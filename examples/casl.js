'use strict';

let restaf   = require('../lib/restaf');
let payload  = require('./config')('restaf.env');
let casSetup = require('./lib/casSetup');

let prtUtil  = require('../prtUtil')

let store = restaf.initStore();
async function example() {
       let {session} = await casSetup(store, payload, 'cas');
       // console.log(JSON.stringify(session.links(), null, 4));
       let casl = `
           action datastep.runcode/ single='YES' code = 'data casuser.a; x=1; run;';
           action table.fetch r=r1/
              table= { caslib= 'casuser', name= 'a' } ;
              run;
              action datastep.runcode/ single='YES' code = 'data casuser.b; y=1; run;';
            action table.fetch r=r2/
              table= { caslib= 'casuser', name= 'b' } ;
              run;
           r = {a:100};
           send_response({a=r1, b=r2});
        `;
             
        let p = {
            action: 'sccasl.runcasl',
            data  : {code: casl}
        };
    
        let r =  await store.runAction(session,p);
        debugger;
       
        console.log( r.items().toJS());
        let a = r.items().toJS();
        console.log(a);
        //console.log(r.items('results').toJS());
        return 'done';
    };

example() 
 .then ( r => console.log(r))
 .catch( err => console.log(err))