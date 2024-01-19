create database costs;

CREATE TABLE categories(
	id serial primary key,
    name text
);

CREATE TABLE projetos(
	id serial primary key,
  name VARCHAR(200),
  budget integer,
  cost integer default 0,
  categories_id integer references categories(id)
);

CREATE TABLE servicos(
	id serial primary key,
  name VARCHAR(200),
  cost integer,
  description text,
  projetos_id integer references projetos(id)
);

insert into categories (name)
values ('Infra'), ('Desenvolvimento'), ('Design'), ('Planejamento');


create table usuario (
	id serial PRIMARY KEY,
  email text not null unique,
  senha text not null
);

alter table projetos ADD COLUMN usuario_id INTEGER references usuario(id);








