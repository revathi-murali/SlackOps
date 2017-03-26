exports.handler = (event, context, callback) => {
    process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT']
    var request = require('./node_modules/request');
    var sns_message  = JSON.parse(event.Records[0].Sns.Message);
    var reference = sns_message.ref.split("/");
    var branch_name = reference[2]
    var slack_conf = require("./config/slack.json")
    var tracking_branch = getTrackingBranch();
    
    if(tracking_branch != null && branch_name == branch_name ){
        commit_message = sns_message.head_commit.message
        committer      = sns_message.head_commit.author.name
        request.post({
            json: true,
            url: slack_conf.post_msg_url,
            qs: {
               "token": slack_conf.token,
               "channel": slack_conf.channel,
                "text" : bot_message(),
                "as_user": true
            },
        }, function(err, resp, body) {
            if (err)
                console.log(err);
            if (body.ok) {
                console.log(body);
            } 
            else {
                console.log(body);
                console.log(resp);
            }
        });
        
    }
    callback(null, "Success");  // Echo back the first key value
};

function bot_message(sns_message){
    commit_message = sns_message.head_commit.message
    committer      = sns_message.head_commit.author.name
    var msg = "Hii!! There is a new commit in the branch Staging. \n Committed by  " + committer + " with the message " + commit_message
    return msg
}

function getTrackingBranch()
{
    var properties =  {
        'token': slack_conf.token,
        'channel': slack_conf.channel_id
    }

    request({url: slack_conf.ch_info_url, qs: properties}, function(err, response, body) {
     if(err) {
        console.log(err); 
        return null; 
     }
     body = JSON.parse(response.body);
     topic_name = body.channel.topic.value;
     return topic_name.split('#')[1]
    });
}