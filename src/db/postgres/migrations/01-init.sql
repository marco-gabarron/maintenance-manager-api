DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'machine_plant') THEN
        CREATE TYPE machine_plant AS ENUM ('fixed', 'mobile');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'machine_service_frequency') THEN
        CREATE TYPE machine_service_frequency AS ENUM ('1month', '3months', '6months', '9months', '12months');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'machine_status') THEN
        CREATE TYPE machine_status AS ENUM ('active', 'inactive(replaced)', 'inactive(scrapped)', 'inactive(breakdown)');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'history_service_level') THEN
        CREATE TYPE history_service_level AS ENUM ('major', 'minor');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'history_service_type') THEN
        CREATE TYPE history_service_type AS ENUM ('pm', 'breakdown', 'service');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS area (
    ID SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL
);

-- CREATE TYPE machine_plant AS ENUM ('fixed', 'mobile');
-- CREATE TYPE machine_service_frequency AS ENUM ('1month', '3months', '6monsths', '9months');
-- CREATE TYPE machine_status AS ENUM ('active', 'inactive(replaced)', 'inactive(scrapped)', 'inactive(breakdown)');

CREATE TABLE IF NOT EXISTS machine (
    ID UUID PRIMARY KEY,
    area_id INT REFERENCES area(ID) ON DELETE CASCADE,
    machine_type VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    plant machine_plant NOT NULL,
    manufacturer VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    serial_number VARCHAR(100) NOT NULL,
    brake_test BOOLEAN DEFAULT FALSE,
    service_frequency machine_service_frequency NOT NULL,
    hours INT,
    mileage INT,
    status machine_status NOT NULL
);

-- CREATE TYPE history_service_level AS ENUM ('major', 'minor');
-- CREATE TYPE history_service_type AS ENUM ('pm', 'breakdown', 'service');

CREATE TABLE IF NOT EXISTS history (
    id UUID PRIMARY KEY,
    machine_id UUID REFERENCES machine(ID) ON DELETE CASCADE,
    date DATE NOT NULL,
    service_level history_service_level NOT NULL,
    description TEXT NOT NULL,
    service_type history_service_type NOT NULL,
    hours_service INT,
    mileage_service INT,
    completed_by VARCHAR(25) NOT NULL
);
