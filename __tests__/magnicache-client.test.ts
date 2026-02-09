const MagniClient = require('../magnicache-client/magnicache-client.ts');
const LocalStorageMock = require('./localStorageMock.js');
global.localStorage = new LocalStorageMock();

describe('MagniClient', () => {
  let magniClient: any;

  beforeEach(() => {
    localStorage.clear();
    magniClient = new MagniClient(2);
  });

  describe('constructor', () => {
    it('should instantiate the cache with the provided maxSize or default', () => {
      expect(magniClient.maxSize).toBe(2);
    });

    it('should initialize the cache from localStorage, if available', () => {
      localStorage.setItem('MagniClient', JSON.stringify(['query1', 'query2']));

      const newMagniClient = new MagniClient();
      expect(newMagniClient.cache).toEqual(['query1', 'query2']);
    });

    it('should not add duplicates to the cache', () => {
      localStorage.setItem(
        'MagniClient',
        JSON.stringify(['query1', 'query2', 'query2'])
      );
      const newMagniClient = new MagniClient();

      expect(newMagniClient.cache).toEqual(['query1', 'query2']);
    });

  });

  describe('set', () => {
    it('should store the provided query and value in localStorage', () => {
      magniClient.set('query1', { data: 'some data' });

      expect(localStorage.getItem('query1')).toBe('{"data":"some data"}');
    });

    it('should add the query to the cache', () => {
      magniClient.set('query1', { data: 'some data' });

      expect(magniClient.cache).toEqual(['query1']);
    });

    it('should remove the least recently used query from the cache if the cache is at maxSize', () => {
      magniClient.set('query1', { data: 'some data' });
      magniClient.set('query2', { data: 'some more data' });
      magniClient.set('query3', { data: 'even more data' });

      expect(magniClient.cache).toEqual(['query2', 'query3']);
      expect(localStorage.getItem('query1')).toBe(null);
    });
  });

  describe('get', () => {
    it('should return the value stored in localStorage for the provided query', () => {
      localStorage.setItem('query1', '{"data":"some data"}');

      expect(magniClient.get('query1')).toEqual({ data: 'some data' });
    });

    it('should move the query to the back of the cache', () => {
      magniClient.set('query1', { data: 'some data' });
      magniClient.set('query2', { data: 'some more data' });

      magniClient.get('query1');
      expect(magniClient.cache).toEqual(['query2', 'query1']);
    });

    it('should return an empty object if the query is not in localStorage', () => {
      expect(magniClient.get('query1')).toEqual({});
    });
  });
});

describe('MagniClient.magniParser', () => {
  let magniClient: any;

  beforeAll(() => {
    magniClient = new MagniClient();
  });

  it('should parse single selection without arguments', () => {
    const selections = [
      {
        kind: 'Field',
        name: {
          kind: 'Name',
          value: 'allMessages',
        },
        arguments: [],
      },
    ];

    const result = magniClient.magniParser(selections);
    expect(result).toEqual(['{allMessages}']);
  });

  it('should parse single selection with arguments', () => {
    const selections = [
      {
        kind: 'Field',
        name: {
          kind: 'Name',
          value: 'messageById',
        },
        arguments: [
          {
            kind: 'Argument',
            name: {
              kind: 'Name',
              value: 'id',
            },
            value: {
              kind: 'StringValue',
              value: '4',
            },
          },
        ],
      },
    ];

    const result = magniClient.magniParser(selections);
    expect(result).toEqual(['{messageById(id:4)}']);
  });

  it('should parse nested selections without arguments', () => {
    const selections = [
      {
        kind: 'Field',
        name: {
          kind: 'Name',
          value: 'allMessages',
        },
        arguments: [],
        selectionSet: {
          kind: 'SelectionSet',
          selections: [
            {
              kind: 'Field',
              name: {
                kind: 'Name',
                value: 'message',
              },
              arguments: [],
            },
          ],
        },
      },
    ];

    const result = magniClient.magniParser(selections);
    expect(result).toEqual(['{allMessages{message}}']);
  });

  it('should parse complex nested selections with arguments', () => {
    const selections = [
      {
        kind: 'Field',
        name: {
          kind: 'Name',
          value: 'messageById',
        },
        arguments: [
          {
            kind: 'Argument',
            name: {
              kind: 'Name',
              value: 'id',
            },
            value: {
              kind: 'StringValue',
              value: '4',
            },
          },
        ],
        selectionSet: {
          kind: 'SelectionSet',
          selections: [
            {
              kind: 'Field',
              name: {
                kind: 'Name',
                value: 'message',
              },
              arguments: [],
            },
          ],
        },
      },
    ];

    const result = magniClient.magniParser(selections);
    expect(result).toEqual(['{messageById(id:4){message}}']);
  });

  it('should handle multiple selections', () => {
    const selections = [
      {
        kind: 'Field',
        name: {
          kind: 'Name',
          value: 'allMessages',
        },
        arguments: [],
      },
      {
        kind: 'Field',
        name: {
          kind: 'Name',
          value: 'allUsers',
        },
        arguments: [],
      },
    ];

    const result = magniClient.magniParser(selections);
    expect(result).toEqual(['{allMessages}', '{allUsers}']);
  });
});
