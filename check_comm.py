import json

with open('/home/ubuntu/gt-backend/data/database.json') as f:
    db = json.load(f)

print('=== COMMUNITY POSTS ===')
for p in db.get('communityPosts', []):
    print('Post ID:', p.get('id'))
    print(' - Title:', p.get('title'))
    print(' - likesCount:', p.get('likesCount'))
    print(' - likedBy:', p.get('likedBy'))
    print(' - commentsCount:', p.get('commentsCount'))

print('=== COMMUNITY COMMENTS ===')
for c in db.get('communityComments', []):
    print('Comment:', c)

