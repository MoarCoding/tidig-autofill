javascript: (() => {
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

  const defsTagname = 'defs';
  const defs = {};
  const defaultProjectKey = 'default';

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

      if (currentRow === `[${defsTagname}]`) {
        readingDefs = true;
        continue;
      } else if (currentRow === `[/${defsTagname}]`) {
        readingDefs = false;
        continue;
      } else if (readingDefs) {
        const splitValues = currentRow.split(' | ');

        if (splitValues.length === 1) {
          defs[defaultProjectKey] = splitValues[0];
        } else {
          defs[splitValues[0].toLowerCase()] = splitValues[1];
        }
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

          projects[word] = (projects[word] ? projects[word] : 0) + amount;
          projectsOfDay[word] = amount;
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

  const enterTimes = (dayTotals, dayTotalsIndex) => {
    $floater.remove();

    if (dayTotalsIndex >= dayTotals.length) {
      return;
    }

    const timeout = 5000;
    const current = dayTotals[dayTotalsIndex];
    const dayNumber = parseInt(
      current.currentDate.match(/[0-9]{2}$/)[0]
    ).toString();
    const totalsOfDayPerProject = {};
    let hasEnteredTime = false;

    Object.entries(current.projectsOfDay).forEach(entry => {
      const key = entry[0];
      const defsKey = defs.hasOwnProperty(key.toLowerCase())
        ? key.toLowerCase()
        : defaultProjectKey;

      if (!totalsOfDayPerProject[defsKey]) {
        totalsOfDayPerProject[defsKey] = current.projectsOfDay[key];
      } else {
        totalsOfDayPerProject[defsKey] += current.projectsOfDay[key];
      }
    });

    const entries = Object.entries(totalsOfDayPerProject);

    entries.forEach((entry, entriesIndex) => {
      const defsKey = entry[0];

      setTimeout(() => {
        const $date = $(`.fc-day-top[data-date="${current.currentDate}"]`);
        let buttonSelector;

        if (!hasEnteredTime) {
          buttonSelector = `tr td:nth-child(${
            $date.closest('td').prevAll().length + 1
          }) a.fullcalendar-new-row`;
        } else {
          buttonSelector = `tr:last-child td.fc-event-container:last-child a.fullcalendar-new-row`;
        }

        hasEnteredTime = true;

        const $button = $date
          .closest('thead')
          .siblings('tbody')
          .find(buttonSelector)
          .click();

        setTimeout(() => {
          $('.text-success')
            .filter((i, el) => $(el).text() === defs[defsKey])
            .click();

          setTimeout(() => {
            $('#timeRowEditAmount').val(roundTotalWorkedHours(entry[1]));

            if (entry[0].toLowerCase() === 'medarbetarsamtal') {
              $('#timeRowEditDescription').val('Medarbetarsamtal');
            }

            $('#timeRowEditSubmit').click();

            if (entriesIndex === entries.length - 1) {
              setTimeout(() => {
                enterTimes(dayTotals, ++dayTotalsIndex);
              }, timeout);
            }
          }, timeout);
        }, timeout);
      }, entriesIndex * (timeout * 3) + timeout);
    });
  };
})();
