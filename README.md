# tidig-autofill
Bookmarklet that automatically enters worked hours into consid's time reporting system

## Usage:
  - Copy the complete contents of tidig_autofill.js and create a bookmarklet using it
  - Go to tidig.consid.net
  - Make sure that the shown time period is in the month being reported
  - Click the bookmark you created
  - Paste your time sheet into the textarea that pops up
  - Click the button next to the textarea
  - The timesheet will begin to fill automatically day by day
  - There are several timeouts since the script has to wait for clicks etc so go make a cup of tea while it runs

## Limitations:
  - Only supports one concurrent work project
  - Reports time for work project OR sick leave, vab etc on any given day
  - Requires one precreated tidmall in tidig for the work project and one for each of sick leave, vab etc 
  - A detailed specification of the reported time will be logged to the console containing details for each day

## Example timesheet:
  ```
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
```
