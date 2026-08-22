from datetime import date
import secrets

from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import Experiment, ExperimentSample, LabNote, LabNoteVersion, Sample, User


SAMPLES = [
    ("SMP-240701", "Human Plasma A-17", "Human Plasma", date(2026, 7, 1), "FZ-02 / Rack A3", "Stored", "-80°C"),
    ("SMP-240702", "DNA Extract BRCA-01", "DNA Extract", date(2026, 7, 2), "FZ-01 / Box B2", "In Use", "-20°C"),
    ("SMP-240703", "E. coli DH5α Batch 8", "Bacterial Culture", date(2026, 7, 3), "INC-03 / Shelf 2", "Processing", "37°C"),
    ("SMP-240704", "HEK293 Culture P12", "Cell Culture", date(2026, 7, 4), "INC-01 / Shelf 4", "In Use", "37°C"),
    ("SMP-240705", "RNA Sample Liver-22", "RNA Sample", date(2026, 7, 5), "FZ-02 / Rack C1", "Stored", "-80°C"),
    ("SMP-240706", "Serum Cohort B-09", "Serum Sample", date(2026, 7, 6), "FZ-01 / Box D4", "Stored", "-20°C"),
    ("SMP-240707", "Protein Extract GFP-4", "Protein Extract", date(2026, 7, 7), "FR-04 / Tray 1", "Processing", "4°C"),
    ("SMP-240708", "Tumor Tissue T-31", "Tissue Sample", date(2026, 7, 8), "FZ-02 / Rack D2", "Quarantined", "-80°C"),
    ("SMP-240709", "PBMC Donor K12", "Cell Culture", date(2026, 7, 9), "LN2-01 / Canister 3", "Stored", "-196°C"),
    ("SMP-240710", "RNA Sample Kidney-07", "RNA Sample", date(2026, 7, 10), "FZ-02 / Rack C2", "Stored", "-80°C"),
    ("SMP-240711", "DNA Extract TP53-05", "DNA Extract", date(2026, 7, 11), "FZ-01 / Box B3", "In Use", "-20°C"),
    ("SMP-240712", "B. subtilis Culture 14", "Bacterial Culture", date(2026, 7, 11), "INC-03 / Shelf 3", "Processing", "30°C"),
    ("SMP-240713", "Plasma Control C-02", "Human Plasma", date(2026, 7, 12), "FZ-02 / Rack A4", "Stored", "-80°C"),
    ("SMP-240714", "CHO Culture P08", "Cell Culture", date(2026, 7, 12), "INC-02 / Shelf 1", "In Use", "37°C"),
    ("SMP-240715", "Protein Extract Cas9", "Protein Extract", date(2026, 7, 13), "FR-04 / Tray 2", "Stored", "4°C"),
    ("SMP-240716", "Brain Tissue BT-16", "Tissue Sample", date(2026, 7, 13), "FZ-02 / Rack E1", "Quarantined", "-80°C"),
    ("SMP-240717", "Serum Cohort A-21", "Serum Sample", date(2026, 7, 14), "FZ-01 / Box D2", "Stored", "-20°C"),
    ("SMP-240718", "mRNA Vaccine Control", "RNA Sample", date(2026, 7, 15), "FZ-02 / Rack C4", "Processing", "-80°C"),
    ("SMP-240719", "DNA Reference NA12878", "DNA Extract", date(2026, 7, 15), "FZ-01 / Box A1", "Stored", "-20°C"),
    ("SMP-240720", "Archived Plasma P-04", "Human Plasma", date(2026, 6, 18), "Archive / Batch 7", "Archived", "-80°C"),
]

EXPERIMENTS = [
    ("EXP-26071", "CRISPR Gene Editing Validation", "Running", "High", "Validate guide RNA editing efficiency and cell viability.", "CRISPR-Cas9 Validation v3.2", ["SMP-240711", "SMP-240715"]),
    ("EXP-26072", "Protein Expression Analysis", "Running", "Medium", "Compare target protein expression across conditions.", "Western Blot Quantification v2", ["SMP-240707", "SMP-240715"]),
    ("EXP-26073", "Bacterial Growth Study", "Planning", "Low", "Characterize growth kinetics for two bacterial strains.", "Growth Curve Assay", ["SMP-240703", "SMP-240712"]),
    ("EXP-26074", "RNA Sequencing Preparation", "On Hold", "High", "Prepare high-quality RNA libraries for sequencing.", "RNA-seq Library Prep v4", ["SMP-240705", "SMP-240710"]),
    ("EXP-26075", "Cell Viability Assay", "Completed", "Medium", "Measure dose-dependent cell viability.", "MTT Assay Standard", ["SMP-240704", "SMP-240714"]),
    ("EXP-26076", "DNA Extraction Optimization", "Draft", "Medium", "Reduce salt carryover while preserving DNA yield.", "Silica Column Extraction", ["SMP-240719"]),
    ("EXP-26077", "Plasma Biomarker Screening", "Running", "High", "Screen candidate biomarkers in plasma cohorts.", "Multiplex ELISA Panel", ["SMP-240701", "SMP-240706"]),
    ("EXP-26078", "HEK293 Transfection Study", "Planning", "Medium", "Optimize transfection conditions in HEK293 cells.", "Lipid Transfection v2", ["SMP-240704"]),
    ("EXP-26079", "Tissue RNA Integrity Review", "Completed", "Low", "Review RNA integrity across tissue samples.", "RIN Assessment", ["SMP-240710", "SMP-240716"]),
    ("EXP-26080", "Legacy Culture Characterization", "Archived", "Low", "Characterize archived bacterial isolates.", "16S Characterization", ["SMP-240712"]),
]

NOTES = [
    ("NOTE-101", "CRISPR validation — Day 4", "EXP-26071", "Editing efficiency increased in the latest replicate. Review control variance before final interpretation.", "Pinned"),
    ("NOTE-102", "Western blot membrane transfer", "EXP-26072", "Transfer completed at 100V for 60 minutes. Membrane quality was acceptable.", "Draft"),
    ("NOTE-103", "Growth curve OD600 readings", "EXP-26073", "Lag phase was observed through hour two; additional time points are planned.", "Pinned"),
    ("NOTE-104", "RNA library concentration", "EXP-26074", "Qubit results were below target for one sample. Preparation is paused pending review.", "Draft"),
    ("NOTE-105", "MTT assay final observation", "EXP-26075", "Dose response was consistent across all wells and the experiment was completed.", "Archived"),
]


def seed_demo_records(db: Session, owner: User) -> None:
    existing_sample_ids = set(db.scalars(select(Sample.id)).all())
    for sample_id, name, sample_type, collected, location, state, temperature in SAMPLES:
        if sample_id not in existing_sample_ids:
            db.add(Sample(
                id=sample_id,
                name=name,
                type=sample_type,
                owner_id=owner.id,
                collection_date=collected,
                location=location,
                status=state,
                temperature=temperature,
                intake_note="Seeded demonstration record for the Helix Lab workspace.",
                qr_token=secrets.token_urlsafe(24),
            ))
    db.flush()

    existing_experiment_ids = set(db.scalars(select(Experiment.id)).all())
    for experiment_id, title, state, priority, objective, protocol, _ in EXPERIMENTS:
        if experiment_id not in existing_experiment_ids:
            db.add(Experiment(
                id=experiment_id,
                title=title,
                owner_id=owner.id,
                status=state,
                priority=priority,
                objective=objective,
                protocol=protocol,
                method_notes="Demonstration experiment seeded for AI and report workflows.",
                start_date=date(2026, 7, 1),
                due_date=date(2026, 8, 1),
            ))
    db.flush()

    existing_links = set(db.execute(select(
        ExperimentSample.experiment_id,
        ExperimentSample.sample_id,
    )).all())
    for experiment_id, _, _, _, _, _, sample_ids in EXPERIMENTS:
        for sample_id in sample_ids:
            if (experiment_id, sample_id) not in existing_links:
                db.add(ExperimentSample(experiment_id=experiment_id, sample_id=sample_id))

    existing_note_ids = set(db.scalars(select(LabNote.id)).all())
    for note_id, title, experiment_id, content, state in NOTES:
        if note_id not in existing_note_ids:
            note = LabNote(
                id=note_id,
                title=title,
                experiment_id=experiment_id,
                author_id=owner.id,
                content=content,
                state=state,
                current_version=1,
            )
            db.add(note)
            db.flush()
            db.add(LabNoteVersion(
                note_id=note.id,
                version_number=1,
                title=title,
                content=content,
                created_by_id=owner.id,
            ))
    db.commit()
