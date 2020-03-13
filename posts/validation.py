from posts.models import PostCreatedEvent, PostUpdatedEvent, PostDeletedEvent
from users.views import error_message, successful_message, validate_user


def validate_create_save(user_id, post_content,
                         post_photo_location):
    if validate_user(user_id):
        # then save
        if post_photo_location is None:
            post_photo_location = ''
        post_event = PostCreatedEvent(type='PostCreatedEvent', user_id=user_id, post_content=post_content,
                                      post_photo_location=post_photo_location)
        post_event.save()
        return successful_message({})
    else:
        return error_message('user id DNE')


def validate_post(post_id, user_id):
    # TODO Janna with her database
    # request the post
    return True


def validate_update_save(post_id, user_id, post_content,
                         post_photo_location):
    if validate_post(post_id, user_id):
        # then save
        post_event = PostUpdatedEvent(type='PostCreatedEvent', post_id=post_id, user_id=user_id,
                                      post_content=post_content,
                                      post_photo_location=post_photo_location)
        post_event.save()
        return successful_message({})
    else:
        return error_message('invalid post, user combo')


def validate_delete_save(post_id, user_id):
    if validate_post(post_id, user_id):
        # then save
        post_event = PostDeletedEvent(type='PostDeletedEvent', post_id=post_id, user_id=user_id)
        post_event.save()
        return successful_message({})
    else:
        return error_message('invalid post, user combo')