SlackOps

Not all QA in an organisation has the access to the code repo on which the appliction runs. Say a QA Engineer raises an issue, he/she needs to communicate with the concerned Dev to know whether the issue has been resolved or not. Though there are various tools to track the issue (JIRA,etc) QA cannot proceed further unless the Dev updates the issue (update in JIRA or communicate directly). There may be a case wherein Dev would have resolved the issue but would have not updated the same due to whatever reason. But QA still assumes that the issue has not been resolved. If there was a way for the QA to track the commit made by the Dev, then QA would have known that the issue is fixed!

Here it comes!

The QA Enginner can subscribe to a slack channel which tracks the commits made in the branch( QA has the option of changing the tracking branch). As soon as the commit is made in the branch, a slackbot posts an message in the channel abt the commit details. The bot also asks whether the commit should trigger a deployment. If needed, QA can trigger the same via a slack command.