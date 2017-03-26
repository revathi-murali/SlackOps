SlackOps

Not all QA in an organisation have the access to the core github repo. Say QA Engineer raises an issue, he needs to communicate with the concerned Dev whether the issue has been resolved or not. Though there are various tools to track the issue (JIRA,etc) unless the Dev updates the issue, QA cannot proceed further. Hence the idea arose where in the QA can subscribe to a slack channel which tracks the commits made in the branch( QA has the option of changing the tracking branch)

As soon as the commit is made in the branch, a slackbot posts an message in the channel the commit details. Deployments can then be triggered via slash command.