import sys
import logging
import rds_config
import pymysql
import json
from query_generation import *

import uuid
from datetime import datetime

# rds settings

rds_host = rds_config.db_host
name = rds_config.db_username
password = rds_config.db_password
db_name = rds_config.db_name

logger = logging.getLogger()
logger.setLevel(logging.INFO)
try:
    conn = pymysql.connect(rds_host, user=name, passwd=password, db=db_name, connect_timeout=5)
except pymysql.MySQLError as e:
    logger.error("Error: unexpected error: could not connect to MySQL instance.")
    logger.error(e)
    sys.exit()

# only need to create table
'''
with conn.cursor() as cur:
    cur.execute("CREATE TABLE post ( post_id  varchar(36) NOT NULL, post_user varchar(36) NOT NULL, post_date "
                "TIMESTAMP, post_content varchar(5000) NOT NULL, post_photo_location varchar(500),"
                " establishment_id varchar(36) NOT NULL, post_rating INT, post_subject varchar(500),"
                " PRIMARY KEY (post_id))")
'''
logger.info("SUCCESS: Connection to RDS MySQL instance succeeded")


def respond(err, res=None):
    return {
        'statusCode': '400' if err else '200',
        'body': err.message if err else json.dumps(res),
        'headers': {
            'Content-Type': 'application/json',
        },
    }


def handler(event, context):
    if 'Records' in event:
        record = event['Records'][0]['dynamodb']['NewImage']
        if record['type']['S'] == "PostCreatedEvent":
            print(record)
            addPost(record)
        elif record['type']['S'] == "PostUpdatedEvent":
            print("Complete me!")
        elif record['type']['S'] == "PostDeletedEvent":
            deletePost(record)
        return None
    else:
        if event['httpMethod'] == "GET":
            return respond(None, getPost(event))


def getPost(getRequestEvent):
    query = generateGetPostSQLQuery(getRequestEvent)
    with conn.cursor() as cur:
        cur.execute(query)
        thePosts = cur.fetchall()
        list = []
        for row in thePosts:
            post = convertResults(row)
            list.append(post)
        conn.commit()
    return list


def addPost(postCreatedEvent):
    query = generatePostSQLQuery(postCreatedEvent)
    with conn.cursor() as cur:
        cur.execute(query)
        conn.commit()


def deletePost(deletePostEvent):
    query = generateDeletePostSQLQuery(deletePostEvent)
    with conn.cursor() as cur:
        cur.execute(query)
        conn.commit()


def updatePost(updatePostEvent):
    print('I have not been defined yet! :( ')


def convertResults(row):
    date = (row[2])  # .strftime("%d-%b-%Y %H:%M:%S.%f")
    post = {'post_id': row[0], 'user_id': row[1], 'post_date': date, 'post_content': row[3],
            'post_photo_location': row[4], 'establishment_id': row[5]}
    return post
