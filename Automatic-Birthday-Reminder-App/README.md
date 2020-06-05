# Automatic Birthday Wisher/Reminder App
## Description:
Many a times HR/ New hire onboarding specialist/Manager has to remember lot of dates with respect to an employee and are required to take a specific action on / prior to the actual date.
This app automatically sends a wishes mail to the employee celebrating his birthday and also reminds reporting manager by sending a notification mail on the employee's birthday.

## Use case
App automatically sends mail wishes to employees who are celebrating birthday on that day and also notifies their respective reporting managers by sending a reminder after scheduling, the use cases given below
|Features demonstrated|Notes|
|---------------------|-----|
|OnAppInstall|It fetches data of all the employees from freshteam and schedules birthday reminder.|
|onEmployeeCreate|When a new employee is created it will schedule their birthday reminder.|
|onScheduledEvent|It sends an email to employee who is celebrating birthday on scheduled day and his/her reporting manager to remind them about his/her employee's birthday.|
|onEmployeeUpdate|Schedule will be deleted when employee is terminated.|
|onEmployeeUpdate|If employee is updated, Schedule will be updated with new details.|
|onAppUninstall|All Schedules are deleted.|
## Prerequisites
- You should have a freshteam account created.
- You should have a sendgrid account and get api from that. 
- Ensure that you have the Freshworks Developer Kit (FDK) installed properly.

## Procedure to run the app locally
- Use 'fdk run' to execute this app 
- Provide Api key from freshteam,domain mail_id,api key from sendgrid and sub domain in this url http://localhost:10001/custom_configs and click install
- Use http://localhost:10001/web/test for testing all events.

## Additional Notes
- Provide input for onEmployeeCreate and onEmployeeUpdate from freshteam documentation and fill necessary details such as date_of_birth,official_email and reporting_to_id before executing.
- This is totally backend app which is automated so i can't show view but i'm sharing recorded video which may help you to run this app. https://youtu.be/GrFkV63bX0E
## Future Work
- We can work on automating other important reminders such as Certifications or Licenses which are about to end and other important dates.  
