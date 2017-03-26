/*
This function handles a Slack slash command and echoes the details back to the user.

Follow these steps to configure the slash command in Slack:

  1. Navigate to https://<your-team-domain>.slack.com/services/new

  2. Search for and select "Slash Commands".

  3. Enter a name for your command and click "Add Slash Command Integration".

  4. Copy the token string from the integration settings and use it in the next section.

  5. After you complete this blueprint, enter the provided API endpoint URL in the URL field.


Follow these steps to encrypt your Slack token for use in this function:

  1. Create a KMS key - http://docs.aws.amazon.com/kms/latest/developerguide/create-keys.html.

  2. Encrypt the token using the AWS CLI.
     $ aws kms encrypt --key-id alias/<KMS key name> --plaintext "<COMMAND_TOKEN>"

  3. Copy the base-64 encoded, encrypted key (CiphertextBlob) to the kmsEncyptedToken variable.

  4. Give your function's role permission for the kms:Decrypt action.
     Example:
       {
         "Version": "2012-10-17",
         "Statement": [
           {
             "Effect": "Allow",
             "Action": [
               "kms:Decrypt"
             ],
             "Resource": [
               "<your KMS key ARN>"
             ]
           }
         ]
       }

Follow these steps to complete the configuration of your command API endpoint

  1. When completing the blueprint configuration select "POST" for method and
     "Open" for security on the Endpoint Configuration page.

  2. After completing the function creation, open the newly created API in the
     API Gateway console.

  3. Add a mapping template for the application/x-www-form-urlencoded content type with the
     following body: { "body": $input.json("$") }

  4. Deploy the API to the prod stage.

  5. Update the URL for your Slack slash command with the invocation URL for the
     created API resource in the prod stage.
*/

var AWS = require('aws-sdk');
var qs = require('querystring');
// var sleep = require('./node_modules/sleep');
var request = require('./node_modules/request');
var opsworks = new AWS.OpsWorks({'access_key_id': 'xxxx', 'secret_access_key': 'xxxxx', 'region': 'us-east-1'});
var token, kmsEncyptedToken;
var stack_id_mapping = {
  'sample_stack' : "xxxxx-yyyyy-zzzz-bbbb-xxxx"
}
var valid_channel = "git-branch-trakcer"

token = "xxxxxx";
kmsEncyptedToken = "yyyyyy";

exports.handler = function (event, context) {
    if (token) {
        // Container reuse, simply process the event with the key in memory
        processEvent(event, context);
    } else if (kmsEncyptedToken && kmsEncyptedToken !== "yyyyyyy") {
        var encryptedBuf = new Buffer(kmsEncyptedToken, 'base64');
        var cipherText = {CiphertextBlob: encryptedBuf};

        var kms = new AWS.KMS();
        kms.decrypt(cipherText, function (err, data) {
            if (err) {
                console.log("Decrypt error: " + err);
                context.fail(err);
            } else {
                token = data.Plaintext.toString('ascii');
                processEvent(event, context);
            }
        });
    } else {
        context.fail("Token has not been set.");
    }
};

var processEvent = function(event, context) {
    var body = event.body;
    var params = qs.parse(body);
    var requestToken = params.token;
    if (requestToken !== token) {
        console.error("Request token (" + requestToken + ") does not match exptected");
        context.fail("Invalid request token");
    }

    var user = params.user_name;
    var command = params.command;
    var channel = params.channel_name;
    var stack_name = params.text;
    
    if (stack_name === "") { 
        context.succeed(" Invalid usage! Use the command as /deploystack <stackname>");
    }
    if(stack_name === "help" || stack_name === "usage"){
        context.succeed(" Use the command as /deploystack <stackname>");
    }

    if(channel != valid_channel){
      context.fail(user + " does not have permissions to execute " + command + " in " + channel + '. Please contact the administrator');
    }

    if(stack_id_mapping[stack_name] === undefined || stack_id_mapping[stack_name] === null ){
      context.fail(user + " invoked " + command + " " +  stack_name + '. But sorry! Could not find the stack or you dont have permissions to the stack');
    }
    else{
      var stack_params = {
        "Command": {
          "Name" : "deploy"
        },
        "StackId": stack_id_mapping[stack_name],
        "AppId" : "1122334455"
      };
      opsworks.createDeployment(stack_params, function(err, data) {
        if (err) {
        context.fail(err);

        } // an error occurred
        else     
        {
            deployment_id = [data.DeploymentId]
            deploy_params = {
                //'DeploymentIds': deployment_id,
                'AppId': "11223344556",
                'StackId' : stack_id_mapping[stack_name]
            };

            deploying_msg =  "\`" + user + "\` has invoked the command " +  command + " in \`" + stack_name + "\` ."
            PostToSlack(deploying_msg, context);
        }
      });
    }
};

function PostToSlack(deploying_msg, context){
  slack_conf = require('./slack.json')
  request.post({
    json: true,
    url: slack_conf.post_msg_url,
    qs: {
       "token": slack_conf.token,
       "channel": slack_conf.channel,
        "text" : deploying_msg,
        "as_user": true
    }},
 function(err, resp, body) {
    if (err)
        console.log(err);
    if (body.ok) {
        context.succeed("Ummm, Deployments will take time!!! Relax a bit");
    } 
    else {
        console.log(body);
        console.log(resp);
    }
  });
}