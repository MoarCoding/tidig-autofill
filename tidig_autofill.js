javascript: (() => {
  /*
  Usage:
    - Copy the complete contents of this file and create a bookmarklet using it
    - Go to tidig.consid.net
    - Make sure that the shown time period is in the month being reported
    - Click the bookmark you created
    - Paste your time sheet into the textarea that pops up
    - Click the button next to the textarea
    - The timesheet will begin to fill automatically day by day
    - There are several timeouts since the script has to wait for clicks etc so go make a cup of tea while it runs

  Limitations:
    - Only supports one concurrent work project
    - Reports time for work project OR sick leave, vab etc on any given day
    - Requires one precreated tidmall in tidig for the work project and one for each of sick leave, vab etc 
    - A detailed specification of the reported time will be logged to the console containing details for each day
  
  Example timesheet:
    [defs]
    projectTemplateName=TELIA       (Exact match for name of tidig's tidmall for project, including casing)
    sickTemplateName=SJUK           (Exact match for name of tidig's tidmall for sick leave, including casing)
    vabTemplateName=VAB             (Exact match for name of tidig's tidmall for taking care of your sick kids, including casing)
    vacationTemplateName=SEMESTER   (Exact match for name of tidig's tidmall for vacations, including casing)
    sickCode=Sjuk                   (What you write when you're sick. Does not match casing)
    vabCode=VAB                     (What you write when you're taking care of your sick kids. Does not match casing)
    vacationCode=Semester           (What you write when you're on vacation. Does not match casing)
    [/defs]


    2021-03-01
    Name of project task    (This will be detailed in the console log)
    08:04-12:32             (Report using time intervals...)
    14:12-15:00

    Name of another project task 2h   (or by specifying number of hours) 


    2021-03-02
    Sjuk 8h


    2021-03-03
    VAB 8h


    2021-03-04
    Semester 8h
  */
  const $body = $(document.body);
  const $floater = $(
    '<div style="position:fixed;top:100px;left:calc(50% - 100px);z-index:9999;padding:10px;border:1px solid black;background:white;">Ange arbetade tider</div>'
  ).appendTo($body);
  const $textarea = $(
    '<textarea id="input" rows="10" style="display:block;width:200px;padding:5px;margin:10px 0;"></textarea>'
  ).appendTo($floater);
  const $collateButton = $(
    '<button type="button" id="collate" class="btn btn-primary btn-lg btn-tidig btn-pop">Sammanställ</button>'
  ).appendTo($floater);
  $collateButton.on('click', parsePxData);

  $('#monthNavigation').click();

  const defsTag = 'defs';
  const defs = {
    projectTemplateName: '',
    sickTemplateName: '',
    vabTemplateName: '',
    vacationTemplateName: '',
    sickCode: '',
    vabCode: '',
    vacationCode: ''
  };

  function parsePxData() {
    var rows = document.getElementById('input').value.split('\n'),
      dayTotals = [],
      projects = {},
      currentProject;

    let currentDate;
    let projectsOfDay;
    let readingDefs = false;

    for (let i = 0; i < rows.length; i++) {
      let currentRow = rows[i].trim();

      if (currentRow === `[${defsTag}]`) {
        readingDefs = true;
        continue;
      } else if (currentRow === `[/${defsTag}]`) {
        readingDefs = false;
        continue;
      } else if (readingDefs) {
        const capturedGroups = currentRow.match(/(.+)=(.+)/);
        defs[capturedGroups[1]] = capturedGroups[2];
        continue;
      }

      if (currentRow.match(/\d{4}-\d{2}-\d{2}/gi)) {
        /* date row */
        if (currentDate) {
          console.log(currentDate, projectsOfDay);
          dayTotals.push({ currentDate, projectsOfDay });
        }

        currentDate = currentRow;
        projectsOfDay = [];
      } else if (currentRow !== '') {
        /* time interval row*/
        if (currentRow.match(/\d{2}:\d{2}-\d{2}:\d{2}/gi)) {
          const calculatedTime = calculateItemTime(currentRow);

          if (calculatedTime < 0) {
            console.log(`END TIME BEFORE START TIME IN ${currentDate}!`);
            return;
          }

          projects[currentProject] += calculatedTime;
          projectsOfDay[currentProject] += calculatedTime;
        } else if (currentRow.match(/\w* \d(,\d)?h/gi)) {
          /* sick row */
          const match = currentRow.match(/(.+) (\d(,\d)?)h/);
          const word = match[1];
          const amount = parseFloat(match[2].replace(',', '.'), 10);

          if (!projects[word]) {
            projects[word] = amount;
            projectsOfDay[word] = amount;
          } else {
            projects[word] += amount;
            projectsOfDay[word] += amount;
          }
        } else {
          currentProject = currentRow;

          if (currentRow.match(/\d{2}:\d{2}-\s*$/)) {
            console.log(`UNTERMINATED TIME-STRING IN ${currentDate}!`);
            return;
          }

          if (!projects[currentProject]) {
            projects[currentProject] = 0;
          }

          if (!projectsOfDay[currentProject]) {
            projectsOfDay[currentProject] = 0;
          }
        }
      }
    }

    if (currentDate) {
      console.log(currentDate, projectsOfDay);
      dayTotals.push({ currentDate, projectsOfDay });
    }

    console.log(projects);

    enterTimes(dayTotals, 0);
  }

  function calculateItemTime(times) {
    if (times.length === 0) return 0;

    var minutesTotal = 0;

    let split = times.split('-');

    let start = new Date(),
      end = new Date();

    start.setHours(split[0].split(':')[0]);
    start.setMinutes(split[0].split(':')[1]);

    end.setHours(split[1].split(':')[0]);
    end.setMinutes(split[1].split(':')[1]);

    minutesTotal += (end - start) / (60 * 60 * 1000);

    times.length = 0;

    return precisionRound(minutesTotal);
  }

  function precisionRound(number, precision = 2) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  }

  const roundTotalWorkedHours = total => Math.round(total * 2) / 2;

  const enterTimes = (dayTotals, index) => {
    if (index >= dayTotals.length) {
      $floater.remove();
      return;
    }

    const timeout = 3000;
    const current = dayTotals[index];
    const dayNumber = parseInt(
      current.currentDate.match(/[0-9]{2}$/)[0]
    ).toString();

    let quickSelectText;
    const currentCode = Object.entries(
      current.projectsOfDay
    )[0][0].toLowerCase();

    switch (currentCode) {
      case defs.sickCode.toLowerCase():
        quickSelectText = defs.sickTemplateName;
        break;
      case defs.vabCode.toLowerCase():
        quickSelectText = defs.vabTemplateName;
        break;
      case defs.vacationCode.toLowerCase():
        quickSelectText = defs.vacationTemplateName;
        break;
      default:
        quickSelectText = defs.projectTemplateName;
    }

    const totalWorkedHours = Object.entries(current.projectsOfDay).reduce(
      (acc, curr) => acc + parseFloat(curr[1]),
      0
    );

    const $date = $('.fc-day-number').filter(
      (i, el) => $(el).text() === dayNumber
    );

    const $button = $date
      .closest('thead')
      .siblings('tbody')
      .find(
        `tr td:nth-child(${
          $date.closest('td').prevAll().length + 1
        }) a.fullcalendar-new-row`
      )
      .click();

    setTimeout(() => {
      $('.text-success')
        .filter((i, el) => $(el).text() === quickSelectText)
        .click();

      setTimeout(() => {
        $('#timeRowEditAmount').val(roundTotalWorkedHours(totalWorkedHours));
        $('#timeRowEditSubmit').click();

        setTimeout(() => {
          enterTimes(dayTotals, ++index);
        }, timeout);
      }, timeout);
    }, timeout);
  };
})();
