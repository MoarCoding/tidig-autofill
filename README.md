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
  - Requires one precreated tidmall in tidig for each item 
  - A detailed specification of the reported time will be logged to the console containing details for each day
  - Times can not span multiple days
  - Currently only Medarbetarsamtal will fill in the comment field automatically. Working on fixing this.

## Example timesheet:
  ```
  [defs]
  TELIA                     // time template used when entered task does not match any of the others
  Sjuk | SJUK               // What you write under a date (casing unimportant) | Name of tidig time template (casing important)
  VAB | VAB
  Semester | SEMESTER
  Medarbetarsamtal | MAS
  [/defs]
  
  
  2021-03-01
  Name of project task    (This will be detailed in the console log)
  08:04-12:32             (Report using time intervals...)
  14:12-15:00
  
  Name of another project task 2h   (or by specifying number of hours) 
  
  
  2021-04-09
  Atlas P1-05873-00057 // default task
  08:29-10:55
  11:41-13:30
  14:19-15:50

  IoT Platform P1-05873-00040 // default task
  11:00-11:26

  Medarbetarsamtal
  13:30-14:19
  
  
  2021-03-02
  Sjuk 8h
  
  
  2021-03-03
  VAB 8h
  
  
  2021-03-04
  Semester 8h
```
