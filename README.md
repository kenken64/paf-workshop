## Workshop Day 21

1. Create a birthday database

```
CREATE SCHEMA `birthday` DEFAULT CHARACTER SET utf8 ;
```

2. Switch to the birthday database

```
use birthday
```

3. Create the RSVP table

```
CREATE TABLE `birthday`.`rsvp` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(45) NOT NULL,
  `phone` VARCHAR(10) NOT NULL,
  `status` ENUM('Count me in!', 'Next time') NOT NULL,
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  PRIMARY KEY (`id`));
```

4. Add new column to the rsvp table

```
ALTER TABLE `birthday`.`rsvp` 
ADD COLUMN `createdDt` DATETIME NOT NULL AFTER `status`,
ADD COLUMN `createdBy` INT NOT NULL AFTER `createdDt`,
ADD COLUMN `updatedDt` DATETIME NULL AFTER `createdBy`,
ADD COLUMN `updatedBy` INT NULL AFTER `updatedDt`;
```

5. Install Mysql driver for node JS

```
npm i mysql --save
```

6. Install dotEnv for environment variable management
```
npm i dotenv --save
```

7. Install app server middleware

```
npm i express body-parser --save
```

8. Install secure env locally and generate the secure .env

```
npm install secure-env
npx secure-env -s itssecret
```

9. Insert into the rsvp table

```
insert into `birthday`.`rsvp` (`name`, `email`, `phone`, `status`, `createdBy`, `createdDt`) values ('Kenneth Phang', 'test@test.com', '7552525', 'Next time', '2', '2008-07-04 00:00:00');

```


```
insert into `birthday`.`rsvp` (`name`, `email`, `phone`, `status`, `createdBy`, `createdDt`) values ('Kenneth Low', 'test@test.com', '7552525', 'Next time', '2', '2008-07-04 00:00:00');

```


```
insert into `birthday`.`rsvp` (`name`, `email`, `phone`, `status`, `createdBy`, `createdDt`) values ('Kenneth Tan', 'test@test.com', '7552525', 'Count me in!', '2', '2008-07-04 00:00:00');

```

10. Start Angular App

```
ng serve --poll=2000 --hmr
```

![Image of Postman](./workshop-day21/screens/postman.png)

![Image of Postman](./workshop-day21/screens/postman2.png)

## Workshop Day 22

## Workshop Day 23

## Workshop Day 24

## Workshop Day 25
