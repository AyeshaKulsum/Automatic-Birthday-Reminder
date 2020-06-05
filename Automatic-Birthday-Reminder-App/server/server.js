"use strict";
/**
 * Sendgrid API is used to Send mails
 */
const sgMail = require("@sendgrid/mail");

/**
 * Save Employee to data storage
 * @param {*} employee
 */
function saveEmployee(employee) {
  var dbKey = String(`{employee_id:${employee.id}}`).substr(0, 30);
  return $db.set(dbKey, {
    employee: employee,
  });
}

/**
 * Get Employee from data storage
 * @param {string} id
 */
function getEmployee(id) {
  var dbKeyget = String(`{employee_id:${id}}`).substr(0, 30);
  return $db.get(`${dbKeyget}`);
}

/**
 *Create schedule for employee to Remind Birthday
 * @param {number} id
 * @param {string} employee_name
 * @param {string} employee_email
 * @param {*} date_of_birth
 * @param {string} manager_mail
 */
function createSchedule(
  id,
  employee_name,
  employee_email,
  date_of_birth,
  manager_mail
) {
  var date = new Date(Date.parse(date_of_birth));
  var year = date.getYear();
  var dt = new Date();
  console.log(date + "date" + date_of_birth + id + employee_name + employee_email + manager_mail)
  console.log(date.toISOString() + "here------------------------------------");
  if (date.getMonth() < dt.getMonth()) {
    date.setYear(dt.getYear() + 1901);
  } else if (date.getMonth() == dt.getMonth()) {
    //For testing today use this condition date.getDay() < dt.getDay() below
    if (date.getDay() <= dt.getDay()) {
      date.setYear(dt.getYear() + 1901);
    } else {
      date.setYear(dt.getYear() + 1900);
    }
  } else {
    date.setYear(dt.getYear() + 1900);
  }
  //For testing now uncomment this lines
  //date.setTime(dt.getTime());
  //date.setMinutes(dt.getMinutes() + 6);
  console.log(id, employee_name, employee_email, date, manager_mail);

  return $schedule.create({
    name: `birthday_reminder ${id}`,
    data: {
      employee_name: employee_name,
      employee_email: employee_email,
      manager_mail: manager_mail,
      year: year,
    },
    schedule_at: date.toISOString(),
    //For testing below commented repeat doesn't work. To automatically send wishes every year uncomment and modify the below code as required.
    // repeat: {
    //   time_unit: "years",
    //   frequency: 1,
    // },
  });
}

/**
 * Sends mail when called
 * @param {string} apiKey
 * @param {string} toMailId
 * @param {string} fromMailId
 * @param {string} subject
 * @param {string} text
 */
function sendingMail(apiKey, toMailId, fromMailId, subject, text) {
  sgMail.setApiKey(apiKey);
  const msg = {
    to: toMailId,
    from: fromMailId,
    subject: subject,
    Text: text,
  };
  console.log(toMailId);
  sgMail
    .send(msg)
    .then(() => {
      console.log("Mail sent for " + toMailId);
    })
    .catch((error) => {
      console.log(error);
      console.log("Mail sent failed for " + toMailId);
    });
}

/**
 * Gets all requirements such as manager mail id and schedules 
 * @param {*} reporting_to_id 
 * @param {*} employee_id 
 * @param {*} employeeName 
 * @param {*} employeeEmail 
 * @param {*} date_of_birth 
 */
function ScheduleEmployeeReminder(reporting_to_id, employee_id, employeeName, employeeEmail, date_of_birth) {
  getEmployee(reporting_to_id).then(
    function (data) {
      // success operation
      console.log("Got manager details");
      if (data.employee.hasOwnProperty("official_email")) {
        //get Value of video
        manager_mail = data.employee.official_email;
      }
      else {
        manager_mail = null
      }
      console.log(manager_mail);
      createSchedule(
        employee_id,
        employeeName,
        employeeEmail,
        date_of_birth,
        manager_mail
      ).then(
        function (data) {
          console.info("Schedule is created");
        },
        function (error) {
          console.info("Schedule Creation Failed");
          console.log(error);
        }
      );
    },
    function (error) {
      console.log("Unable to fetch Manager data");
      console.log(error);
      manager_mail = ""
      createSchedule(
        employee_id,
        employeeName,
        employeeEmail,
        date_of_birth,
        manager_mail
      ).then(
        function (data) {
          console.info("Schedule is created");
        },
        function (error) {
          console.info("Schedule Creation Failed");
          console.log(error);
        });
    }
  );
}

/**
 * This will delete schedule
 * @param {integer} employee_id 
 */
function deleteSchedule(employee_id) {
  return $schedule.delete({
    name: `birthday_reminder ${employee_id}`
  })
    .then(function (data) {
      //"data" is a json with status and message.
      console.log("Schedule has been deleted successfully")
      console.log(data)
    }, function (err) {
      //"err" is a json with status and message.
      console.log("Unable to delete schedule")
      console.log(err)
    });
}

/**
 * All the Events
 */
exports = {
  events: [
    { event: "onEmployeeCreate", callback: "onEmployeeCreateHandler" },
    { event: "onEmployeeUpdate", callback: "onEmployeeUpdateCallback" },
    { event: "onScheduledEvent", callback: "onScheduledEventHandler" },
    { event: "onAppInstall", callback: "onInstallHandler" },
    { event: "onAppUninstall", callback: "onAppUninstallCallback" }
  ],
  /**
   * Getting all employees from freshteam and storing it in data storage
   */
  onInstallHandler: function (payload) {
    renderData();
    var headers = {
      accept: "application/json",
      Authorization: `Bearer ${payload.iparams.freshteamApiKey}`,
    };
    var options = { headers: headers };
    var url = `https://${payload.iparams.domainName}.freshteam.com/api/employees`;
    $request.get(url, options).then(
      function (data) {
        employees = JSON.parse(data.response);
        for (i = 0; i < employees.length; i++) {
          saveEmployee(employees[i]).then(
            function (data) {
              console.log("Succesfully saved Employee data");
            },
            function (error) {
              // failure operation
              console.log("Failed saving Employee's data");
              console.log(error);
            }
          );
        }
        for (i = 0; i < employees.length; i++) {
          var employeeName = `${employees[i].first_name} ${employees[i].last_name}`;
          ScheduleEmployeeReminder(employees[i].reporting_to_id, employees[i].id, employeeName, employees[i].official_email, employees[i].date_of_birth)
        }
      },
      function (error) {
        console.log("Unable to fetch all employee data from freshteam");
        console.log(error);
      }
    );

  },

  /**
   * When new employee is created it schedules reminder for birthday
   * and stores employee in data storage
   * @param {*} payload
   */
  onEmployeeCreateHandler: function (payload) {
    var employeeName = `${payload.data.employee.first_name} ${payload.data.employee.last_name}`;
    var employeeEmail = payload.data.employee.official_email;

    console.log(payload.data.employee.reporting_to_id);

    /**
     *This function call is to Schedule Reminder
     */
    ScheduleEmployeeReminder(payload.data.employee.reporting_to_id, payload.data.employee.id, employeeName, employeeEmail, payload.data.employee.date_of_birth)

    /**
     * Saving new employee which is created to data storage
    */
    saveEmployee(payload.data.employee).then(
      function (data) {
        console.log("Succesfully saved Employee data");
      },
      function (error) {
        // failure operation
        console.log("Failed saving Employee's data");
        console.log(error);
      }
    );
  },
  /**
   * When onScheduledEventHandler is triggered on scheduled date,
   * this sends reminder mail to manager and Birthday Wishes to Employee
   * @param {*} payload
   */
  onScheduledEventHandler: function (payload) {
    console.info(
      "Logging arguments from onScheduledEvent: " + JSON.stringify(payload)
    );
    year = payload.data.year;
    var date = new Date();
    var age = date.getYear() + 1900 - year;
    var subjectToEmployee = "Happy Birthday";
    var textToEmployee =
      "Hi " +
      payload.data.employee_name +
      " " +
      "Wishing you on your " +
      age +
      "th Birthday. Many more happy return of the day.";
    sendingMail(
      payload.iparams.apiKey,
      payload.data.employee_email,
      payload.iparams.Email,
      subjectToEmployee,
      textToEmployee
    );
    manager_mail = payload.data.manager_mail
    if (manager_mail.localeCompare("") != 0) {
      var subjectToManager = "Birthday Reminder";
      var textToManager =
        "Hi " +
        "Today " +
        payload.data.employee_name +
        " is celebrating birthday.";
      sendingMail(
        payload.iparams.apiKey,
        payload.data.manager_mail,
        payload.iparams.Email,
        subjectToManager,
        textToManager
      );
    }
  },
  /**
   * If employee details are updated then it will delete and schedule with new details.
   * When employee is terminated then his schedule will be deleted.
   * @param {*} payload 
   */
  onEmployeeUpdateCallback: function (payload) {
    console.log("Arguments from the onEmployeeUpdate event: " + JSON.stringify(payload));
    deleteSchedule(payload.data.employee.id)
    if (payload.data.employee.deleted == false) {
      var employeeName = `${payload.data.employee.first_name} ${payload.data.employee.last_name}`;
      ScheduleEmployeeReminder(payload.data.employee.reporting_to_id, payload.data.employee.id, employeeName, payload.data.employee.official_email, payload.data.employee.date_of_birth)
    }
  },
  /**
   * On app uninstall this will delete all the schedules
   * @param {*} payload 
   */
  onAppUninstallCallback: function (payload) {
    console.log("Hello")
    renderData();
    var headers = {
      accept: "application/json",
      Authorization: `Bearer ${payload.iparams.freshteamApiKey}`,
    };
    var options = { headers: headers };
    var url = `https://${payload.iparams.domainName}.freshteam.com/api/employees`;
    $request.get(url, options).then(
      function (data) {
        employees = JSON.parse(data.response);
        for (i = 0; i < employees.length; i++) {
          deleteSchedule(employees[i].id)
        }
      },
      function (error) {
        console.log("Unable to fetch all employee data from freshteam");
        console.log(error);
      }
    );

  }
};
