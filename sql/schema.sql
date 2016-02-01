create database sms_service;
create table messages(
	sender_id varchar(40) default null ,
	sender_number varchar(40) default null ,
	status boolean default false,
	content text default null ,
	failure_reason text default null,
	time timestamp default CURRENT_TIMESTAMP
);