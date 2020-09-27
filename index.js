const { ApolloClient, InMemoryCache } = require('@apollo/client')
const { ApolloServer, gql, PubSub, withFilter } = require('apollo-server')
const { GraphQLScalarType } = require('graphql')

const books = require('./data/books.json')
const libraries = require('./data/libraries.json')
const posts = require('./data/posts.json')

const pubsub = new PubSub()

const client = new ApolloClient({
  cache: new InMemoryCache(),
})

const typeDefs = gql`
  scalar DateTime

  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  enum AvailabilityStatus {
    IN
    OUT
  }
  type Book {
    id: ID
    title: String
    author: String
    status: AvailabilityStatus
  }

  type Library {
    id: ID
    name: String
    address: LibraryAddress
    phone: String
  }

  type LibraryAddress {
    city: String
    state: String
    zip: String
  }

  type Query {
    posts: [Post]
    getAllBooks(status: AvailabilityStatus): [Book]
    getBookById(id: String): [Book]
    getBooksByAuthor(author: String): [Book]
    getLibrary: [Library]
    getLibraryByName(name: String): [Library]
  }

  type Post {
    author: String
    comment: String
  }

  type SetBookStatusPayload {
    changed: DateTime
    book: Book
  }

  type Mutation {
    setBookStatus(id: ID, status: AvailabilityStatus): SetBookStatusPayload
  }

  type Subscription {
    bookStatusSet: SetBookStatusPayload
  }
`
const BOOK_STATUS_SET = 'BOOK_STATUS_SET'
const resolvers = {
  Query: {
    posts: (parent, args) => {
      return posts
    },
    getLibraryByName: (parent, args) => {
      console.log('test')
      //  let final = libraries.filter((a) => a.name.includes(args.name))
      return libraries.filter((a) => a.name.includes(args.name))
    },
    getLibrary: (parent, args) => {
      return libraries
    },
    getAllBooks: (parents, args) => {
      console.log('args', args)
      if (!args.status) {
        return books
      } else {
        return books.filter((book) => book.status === args.status)
      }
    },
    getBookById: (parent, args) => {
      let bookById = books.filter((book) => book.id === args.id)
      console.log('args', bookById)

      return bookById
    },
    getBooksByAuthor: (parent, args) => {
      let bookList = books.filter((a) => a.author === args.author)
      return bookList
    },
  },
  Mutation: {
    setBookStatus: (parents, args) => {
      // console.log('set', args)
      let bookStatus = books.find((a) => a.id === args.id)

      bookStatus.status = args.status

      console.log('BRYAN', bookStatus)
      // console.log('books', bookStatus.status)
      pubsub.publish(BOOK_STATUS_SET, {
        //will hit the bookStatusSet subscrition resolver
        bookStatusSet: {
          changed: new Date(),
          book: bookStatus,
        },
      })
      return {
        book: bookStatus,
        changed: new Date(),
      }
    },
  },
  Subscription: {
    bookStatusSet: {
      // Additional event labels can be passed to asyncIterator creation
      subscribe: (payload) => {
        console.log('payload', payload)
        return pubsub.asyncIterator([BOOK_STATUS_SET])
      },
    },
  },
}

const server = new ApolloServer({ typeDefs, resolvers, client })

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})
