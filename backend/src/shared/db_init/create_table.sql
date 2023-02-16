SET client_encoding = 'UTF8';
-- CREATE DATABASE projects;

CREATE SCHEMA dbo;
CREATE EXTENSION postgis;

CREATE TABLE CLSurvey(
	SurveyId Char(36) NOT NULL,
	Confidential smallint NULL,
	JobNumber Varchar(20) NULL,
	Objective Varchar(50) NULL,
	ObjectiveOther Varchar(50) NULL,
	SiteID Varchar(50) NULL,
	SiteAddress Varchar(1024) NULL,
	JobPhase Varchar(50) NULL,
	JobTask Varchar(50) NULL,
	ProjectName Varchar(500) NULL,
	JobPhaseName Varchar(500) NULL,
	JobTaskName Varchar(500) NULL,
	Created Timestamp(3) NULL,
	CreatedBy Varchar(255) NULL,
	LastModified Timestamp(3) NULL,
	LastModifiedBy Varchar(255) NULL,
 CONSTRAINT PK_TTCL_SoilSampleSurvey PRIMARY KEY 
(
	SurveyId 
) 
);

CREATE TABLE CLSurveyGeology(
	GeologyId Char(36) NOT NULL,
	PointId Char(36) NULL,
	FromDepth numeric(38, 8) NOT NULL,
	ToDepth numeric(38, 8) NOT NULL,
	ManualSoilDescription Varchar(1024) NULL,
	HasOdourOrStain Boolean NULL,
	OdourStain Varchar(1024) NULL,
	SubordinateFraction Varchar(50) NULL,
	MajorFraction Varchar(50) NULL,
	MinorFractionWith Varchar(50) NULL,
	MinorFractionContent Varchar(50) NULL,
	Colour Varchar(250) NULL,
	Strength Varchar(50) NULL,
	Moisture Varchar(50) NULL,
	Plasticity Varchar(50) NULL,
	Comments Varchar(1024) NULL,
	ParticleSize Varchar(50) NULL,
	GeologicalUnit Varchar(50) NULL,
	Created Timestamp(3) NULL,
	CreatedBy Varchar(255) NULL,
	LastModified Timestamp(3) NULL,
	LastModifiedBy Varchar(255) NULL,
 CONSTRAINT PK_CLSurveyGeology PRIMARY KEY 
(
	GeologyId 
) 
);

CREATE TABLE CLSurveyGeologyPhoto(
	PhotoId Char(36) NOT NULL,
	GeologyId Char(36) NULL,
	FileName Varchar(500) NULL,
	Url Varchar(2000) NULL,
	FileSize int NULL
);

CREATE TABLE CLSurveyPhoto(
	PhotoId Char(36) NOT NULL,
	SurveyId Char(36) NULL,
	FileName Varchar(500) NULL,
	Url Varchar(2000) NULL,
	FileSize int NULL,
	Comment Varchar(2000) NULL,
 CONSTRAINT PK_CLSurveyPhoto PRIMARY KEY 
(
	PhotoId 
) 
);

CREATE TABLE CLSurveyPoint(
	PointId Char(36) NOT NULL,
	SurveyID Char(36) NULL,
	PointName Varchar(50) NULL,
	CollectionDate Timestamp(6) NOT NULL,
	Staff Varchar(50) NULL,
	SampleType Varchar(50) NOT NULL,
	SampleTypeOther Varchar(50) NULL,
	SampleMethod Varchar(50) NULL,
	SampleMethodOther Varchar(50) NULL,
	Comments Varchar(1023) NULL,
	Created Timestamp(3) NULL,
	CreatedBy Varchar(255) NULL,
	LastModified Timestamp(3) NULL,
	LastModifiedBy Varchar(255) NULL,
	SHAPE geometry NULL,
 CONSTRAINT PK_SoilSamplePoint PRIMARY KEY 
(
	PointId 
) 
);

CREATE TABLE CLSurveyPointPhoto(
	PhotoId Char(36) NOT NULL,
	PointId Char(36) NULL,
	FileName Varchar(500) NULL,
	Url Varchar(2000) NULL,
	FileSize int NULL,
	Comment Varchar(2000) NULL,
 CONSTRAINT PK_CLSurveyPointPhoto PRIMARY KEY 
(
	PhotoId 
) 
);

CREATE TABLE CLSurveySample(
	SampleId Char(36) NOT NULL,
	PointId Char(36) NULL,
	Created Timestamp(3) NULL,
	CreatedBy Varchar(255) NULL,
	LastModified Timestamp(3) NULL,
	LastModifiedBy Varchar(255) NULL,
	FromDepth numeric(38, 8) NOT NULL,
	ToDepth numeric(38, 8) NULL,
	Comment Varchar(1024) NULL,
	SampleMaterialType Varchar(50) NULL,
	CollectionDateTime Timestamp(6) NULL,
 CONSTRAINT PK_CLSurveySample PRIMARY KEY 
(
	SampleId 
) 
);

CREATE TABLE CLSurveySampleContainer(
	SampleId Char(36) NOT NULL,
	LabCode Varchar(50) NOT NULL,
	ContainerType Varchar(20) NULL,
	IsDuplicate Boolean NULL,
	DuplicateName Varchar(50) NULL,
 CONSTRAINT PK_CLSurveySampleContainer PRIMARY KEY 
(
	SampleId,
	LabCode 
) 
);

CREATE TABLE CLSurveySamplePhoto(
	PhotoId Char(36) NOT NULL,
	SampleId Char(36) NULL,
	FileSize int NULL,
	FileName Varchar(500) NULL,
	Url Varchar(2000) NULL,
	Comment Varchar(2000) NULL,
 CONSTRAINT PK_CLSurveySamplePhoto PRIMARY KEY 
(
	PhotoId 
) 
);
ALTER TABLE CLSurveyGeology  ADD  CONSTRAINT FK_CLSurveyGeology_CLSurveyPoint FOREIGN KEY(PointId)
REFERENCES CLSurveyPoint (PointId);
 
ALTER TABLE CLSurveyGeology VALIDATE CONSTRAINT FK_CLSurveyGeology_CLSurveyPoint;
 
ALTER TABLE CLSurveyGeologyPhoto  ADD  CONSTRAINT FK_CLSurveyGeologyPhoto_CLSurveyGeology FOREIGN KEY(GeologyId)
REFERENCES CLSurveyGeology (GeologyId);
 
ALTER TABLE CLSurveyGeologyPhoto VALIDATE CONSTRAINT FK_CLSurveyGeologyPhoto_CLSurveyGeology;
 
ALTER TABLE CLSurveyPhoto  ADD  CONSTRAINT FK_CLSurveyPhoto_CLSurvey FOREIGN KEY(SurveyId)
REFERENCES CLSurvey (SurveyId);
 
ALTER TABLE CLSurveyPhoto VALIDATE CONSTRAINT FK_CLSurveyPhoto_CLSurvey;
 
ALTER TABLE CLSurveyPoint  ADD  CONSTRAINT FK_CLSurveyPoint_CLSurvey FOREIGN KEY(SurveyID)
REFERENCES CLSurvey (SurveyId);
 
ALTER TABLE CLSurveyPoint VALIDATE CONSTRAINT FK_CLSurveyPoint_CLSurvey;
 
ALTER TABLE CLSurveyPointPhoto  ADD  CONSTRAINT FK_CLSurveyPointPhoto_CLSurveyPoint FOREIGN KEY(PointId)
REFERENCES CLSurveyPoint (PointId);
 
ALTER TABLE CLSurveyPointPhoto VALIDATE CONSTRAINT FK_CLSurveyPointPhoto_CLSurveyPoint;
 
ALTER TABLE CLSurveySample  ADD  CONSTRAINT FK_CLSurveySample_CLSurveyPoint FOREIGN KEY(PointId)
REFERENCES CLSurveyPoint (PointId);
 
ALTER TABLE CLSurveySample VALIDATE CONSTRAINT FK_CLSurveySample_CLSurveyPoint;
 
ALTER TABLE CLSurveySampleContainer  ADD  CONSTRAINT FK_CLSurveySampleContainer_CLSurveySample FOREIGN KEY(SampleId)
REFERENCES CLSurveySample (SampleId);
 
ALTER TABLE CLSurveySampleContainer VALIDATE CONSTRAINT FK_CLSurveySampleContainer_CLSurveySample;
 
ALTER TABLE CLSurveySamplePhoto  ADD  CONSTRAINT FK_CLSurveySamplePhoto_CLSurveySample FOREIGN KEY(SampleId)
REFERENCES CLSurveySample (SampleId);
 
ALTER TABLE CLSurveySamplePhoto VALIDATE CONSTRAINT FK_CLSurveySamplePhoto_CLSurveySample;
 
