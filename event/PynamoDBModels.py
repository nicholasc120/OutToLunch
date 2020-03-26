from pynamodb.models import Model
from pynamodb.attributes import UnicodeAttribute, MapAttribute, UTCDateTimeAttribute, NumberAttribute
from OutToLunch.config import DynamoDBAccessKey, DynamoDBKeyID

PostCreatedEvent = 'PostCreatedEvent'
PostUpdatedEvent = 'PostUpdatedEvent'
PostDeletedEvent = 'PostDeletedEvent'
AccountCreatedEvent = 'AccountCreatedEvent'
AccountUpdatedEvent = 'AccountUpdatedEvent'
AccountDeletedEvent = 'AccountDeletedEvent'
CommentCreatedEvent = 'CommentCreatedEvent'
CommentUpdatedEvent = 'CommentUpdatedEvent'
CommentDeletesEvent = 'CommentDeleteEvent'


class Post(MapAttribute):
    post_id = UnicodeAttribute()
    post_user = UnicodeAttribute(null=True)
    post_date = UnicodeAttribute(null=True)
    post_rating = NumberAttribute(null=True)
    post_subject = UnicodeAttribute(null=True)
    post_content = UnicodeAttribute(null=True)
    post_photo_location = UnicodeAttribute(null=True)
    establishment_id = UnicodeAttribute(null=True)


class CreateComment(MapAttribute):
    commentID = UnicodeAttribute()
    userID = UnicodeAttribute()
    parentID = UnicodeAttribute()
    content = UnicodeAttribute()
    dateMs = NumberAttribute()


class UpdateComment(MapAttribute):
    commentID = UnicodeAttribute()
    userID = UnicodeAttribute()
    parentID = UnicodeAttribute()
    content = UnicodeAttribute()
    dateMs = NumberAttribute()
    numChildren = NumberAttribute()


class WipeComment(MapAttribute):
    commentID = UnicodeAttribute()
    userID = UnicodeAttribute()
    parentID = UnicodeAttribute()
    content = UnicodeAttribute()
    dateMs = NumberAttribute()
    numChildren = NumberAttribute()


class Event(Model):
    class Meta:
        table_name = 'OutToLunchEvents'
        region = 'us-west-2'
        aws_access_key_id = DynamoDBKeyID
        aws_secret_access_key = DynamoDBAccessKey

    event_id = UnicodeAttribute(hash_key=True)
    type = UnicodeAttribute()
    timestamp = UTCDateTimeAttribute()
    data = MapAttribute()
