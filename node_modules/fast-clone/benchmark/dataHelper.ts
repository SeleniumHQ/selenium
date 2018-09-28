import * as faker from 'faker';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;

interface Employment {
  companyName: string;
}

interface Person {
  name: string;
  employment: Employment;
  regex: RegExp;
  age: number;
  dateOfBirth: Date;
  enrolledToVote: boolean;
  parents?: Person[];
}

interface GetRandomPersonOptions {
  maxDateOfBirth?: Date;
  minAge?: number;
  maxAge?: number;
  depth?: number;
}

export function getRandomPerson(options: GetRandomPersonOptions) {
  const opts: GetRandomPersonOptions = options || {};

  opts.maxDateOfBirth = opts.maxDateOfBirth || new Date(Date.now() - MS_IN_YEAR);
  opts.minAge = opts.minAge || 18;
  opts.maxAge = opts.maxAge || 105;
  opts.depth = opts.depth || 0;

  // Generates a family tree...of sorts
  const result: Person = {
    name: faker.name.lastName() + faker.name.firstName(),
    employment: {
      companyName: faker.company.companyName()
    },
    regex: /a/g,
    age: faker.random.number(),
    dateOfBirth: faker.date.past(),
    enrolledToVote: faker.random.boolean(),
  };

  if (opts.depth > 0) {
    result.parents = [
      getRandomPerson({ depth: opts.depth - 1 }),
      getRandomPerson({ depth: opts.depth - 1 })
    ];
  }

  return result;
}

function getTempFileName() {
  return path.join(os.tmpdir(), Math.floor((Math.random() * 10000000)).toString() + '.yo.tmp');
}

export function getJsonSize(obj, callback) {
  var tempFileName = getTempFileName();
  var text = JSON.stringify(obj, null, '\t');

  fs.writeFile(tempFileName, text, { encoding: 'utf8' }, function (err) {
    fs.stat(tempFileName, function (err, stats) {
      fs.unlink(tempFileName, function () {
        callback(stats.size);
      });
    });
  });
}
