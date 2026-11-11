import asyncio
import pymongo
from typing import Optional, Dict, Any
from app.core.config import settings

_mongo_client = None
_mongo_db = None

def get_mongo_db():
    global _mongo_client, _mongo_db
    if not settings.MONGODB_URI:
        return None
    if _mongo_db is None:
        try:
            _mongo_client = pymongo.MongoClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=2000,
                connectTimeoutMS=2000
            )
            # Use database 'polyarguminds'
            _mongo_db = _mongo_client.get_database("polyarguminds")
        except Exception as e:
            print(f"MongoDB connection warning: {e}")
            return None
    return _mongo_db

def _sync_save_session(session_data: Dict[str, Any]):
    try:
        db = get_mongo_db()
        if db is not None:
            db.sessions.update_one(
                {"id": session_data.get("id")},
                {"$set": session_data},
                upsert=True
            )
    except Exception as e:
        print(f"MongoDB save session warning: {e}")

def _sync_save_turn(session_id: str, turn_data: Dict[str, Any]):
    try:
        db = get_mongo_db()
        if db is not None:
            db.turns.update_one(
                {"id": turn_data.get("id")},
                {"$set": {"session_id": session_id, **turn_data}},
                upsert=True
            )
    except Exception as e:
        print(f"MongoDB save turn warning: {e}")

def _sync_save_verdict(session_id: str, verdict_data: Dict[str, Any]):
    try:
        db = get_mongo_db()
        if db is not None:
            db.verdicts.update_one(
                {"session_id": session_id},
                {"$set": {"session_id": session_id, **verdict_data}},
                upsert=True
            )
    except Exception as e:
        print(f"MongoDB save verdict warning: {e}")

def _sync_delete_session(session_id: str):
    try:
        db = get_mongo_db()
        if db is not None:
            db.sessions.delete_one({"id": session_id})
            db.turns.delete_many({"session_id": session_id})
            db.verdicts.delete_one({"session_id": session_id})
    except Exception as e:
        print(f"MongoDB delete session warning: {e}")

def delete_session_from_mongo(session_id: str):
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            loop.run_in_executor(None, _sync_delete_session, session_id)
        else:
            _sync_delete_session(session_id)
    except Exception:
        pass

def save_session_to_mongo(session_data: Dict[str, Any]):
    # Non-blocking fire-and-forget
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            loop.run_in_executor(None, _sync_save_session, session_data)
        else:
            _sync_save_session(session_data)
    except Exception:
        pass

def save_turn_to_mongo(session_id: str, turn_data: Dict[str, Any]):
    # Non-blocking fire-and-forget
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            loop.run_in_executor(None, _sync_save_turn, session_id, turn_data)
        else:
            _sync_save_turn(session_id, turn_data)
    except Exception:
        pass


def _sync_save_user(user_data: Dict[str, Any]):
    try:
        db = get_mongo_db()
        if db is not None:
            db.users.update_one(
                {"email": user_data.get("email")},
                {"$set": user_data},
                upsert=True
            )
    except Exception as e:
        print(f"MongoDB save user warning: {e}")


def save_user_to_mongo(user_data: Dict[str, Any]):
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            loop.run_in_executor(None, _sync_save_user, user_data)
        else:
            _sync_save_user(user_data)
    except Exception:
        pass

def save_verdict_to_mongo(session_id: str, verdict_data: Dict[str, Any]):
    # Non-blocking fire-and-forget
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            loop.run_in_executor(None, _sync_save_verdict, session_id, verdict_data)
        else:
            _sync_save_verdict(session_id, verdict_data)
    except Exception:
        pass

