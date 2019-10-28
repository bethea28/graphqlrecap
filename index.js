const { ApolloServer, gql } = require('apollo-server')
const books = require('./data/books.json')

const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  enum AvailabilityStatus {
    IN
    OUT
  }
  type Book {
    id: String
    title: String
    author: String
    status: AvailabilityStatus
  }

  type Query {
    getAllBooks(status: AvailabilityStatus): [Book]
    getBookById(id: String): [Book]
  }
`

const resolvers = {
  Query: {
    getAllBooks: (parents, args) => {
      console.log('args', args)
      if (!args) {
        return books
      } else {
        return books.filter(book => book.status === args.status)
      }
    },
    getBookById: (parent, args) => {
      let bookById = books.filter(book => book.id === args.id)
      console.log('args', bookById)

      return bookById
    }
  }
}

const server = new ApolloServer({ typeDefs, resolvers })

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})
