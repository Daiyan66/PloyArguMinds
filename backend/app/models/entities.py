import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.db import Base

class UserModel(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, default=lambda: f"usr_{uuid.uuid4().hex[:12]}")
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    avatar = Column(Text, nullable=True)
    google_id = Column(String(128), unique=True, nullable=True, index=True)
    role = Column(String(64), default="Executive Decision Arbiter")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    sessions = relationship("SessionModel", back_populates="user", cascade="all, delete-orphan")


class SessionModel(Base):
    __tablename__ = "sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    topic = Column(Text, nullable=False)
    mode = Column(String(32), nullable=False, default="DEBATE")  # 'DEBATE' or 'COLLABORATIVE'
    status = Column(String(32), nullable=False, default="ACTIVE")  # 'ACTIVE', 'PAUSED', 'COMPLETED'
    total_rounds = Column(Integer, nullable=False, default=5)
    current_round = Column(Integer, nullable=False, default=1)
    file_name = Column(Text, nullable=True)
    file_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("UserModel", back_populates="sessions")
    chunks = relationship("DocumentChunkModel", back_populates="session", cascade="all, delete-orphan")
    personas = relationship("PersonaModel", back_populates="session", cascade="all, delete-orphan")
    turns = relationship("TurnModel", back_populates="session", cascade="all, delete-orphan")
    interjections = relationship("InterjectionModel", back_populates="session", cascade="all, delete-orphan")
    verdict = relationship("VerdictModel", back_populates="session", uselist=False, cascade="all, delete-orphan")


class DocumentChunkModel(Base):
    __tablename__ = "document_chunks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False)
    file_name = Column(Text, nullable=False)
    page_number = Column(Integer, nullable=False, default=1)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    embedding = Column(JSON, nullable=True)  # Stored as JSON float array for universal DB support
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("SessionModel", back_populates="chunks")


class PersonaModel(Base):
    __tablename__ = "personas"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False)
    identifier = Column(String(32), nullable=False)  # 'agent_a', 'agent_b', 'judge'
    name = Column(String(64), nullable=False)
    role_title = Column(String(128), nullable=False)
    bias_direction = Column(String(32), nullable=False)  # 'FOR', 'AGAINST', 'NEUTRAL'
    core_worldview = Column(Text, nullable=False)
    system_prompt = Column(Text, nullable=False)
    avatar_color = Column(String(16), nullable=False, default="#6366F1")
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("SessionModel", back_populates="personas")
    turns = relationship("TurnModel", back_populates="persona")


class TurnModel(Base):
    __tablename__ = "turns"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False)
    persona_id = Column(String(36), ForeignKey("personas.id"), nullable=True)
    round_number = Column(Integer, nullable=False)
    phase = Column(String(32), nullable=False)  # 'FOUNDATION', 'EVIDENCE', 'CLASH', 'INTERJECTION'
    content = Column(Text, nullable=False)
    citations = Column(JSON, default=list)  # list of {source, snippet, page}
    fallacies = Column(JSON, default=list)  # list of {type, quote, explanation}
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("SessionModel", back_populates="turns")
    persona = relationship("PersonaModel", back_populates="turns")


class InterjectionModel(Base):
    __tablename__ = "interjections"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False)
    user_name = Column(String(64), nullable=False, default="Moderator")
    content = Column(Text, nullable=False)
    target_persona_id = Column(String(36), ForeignKey("personas.id"), nullable=True)
    applied_to_round = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("SessionModel", back_populates="interjections")


class VerdictModel(Base):
    __tablename__ = "verdicts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("sessions.id", ondelete="CASCADE"), unique=True, nullable=False)
    winner_identifier = Column(String(32), nullable=True)
    scorecard = Column(JSON, nullable=False)
    key_concessions = Column(JSON, default=list)
    unresolved_risks = Column(JSON, default=list)
    executive_recommendation = Column(Text, nullable=False)
    action_plan = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("SessionModel", back_populates="verdict")
