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
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.

  type Mutation {
    # setBookStatus(id: ID, status: AvailabilityStatus): SetBookStatusPayload
    createPost(comment: String): Post
  }
  type Query {
    # setBookStatus(id: ID, status: AvailabilityStatus): SetBookStatusPayload
    getAllPosts: [Post]
  }

  type Post {
    id: ID
    user: User
    comment: String
  }

  type User {
    id: ID
    fName: String
    lName: String
  }

  input PostInput {
    id: ID
    user: UserInput
    comment: String
  }

  input UserInput {
    id: ID
    fName: String
    lName: String
  }
`
const BOOK_STATUS_SET = 'BOOK_STATUS_SET'
const resolvers = {
  Query: {
    getAllPosts: (obj, args, context, info) => {
      console.log('obj', obj)
      console.log('args', args)
      return posts
    },
    // getLibraryByName: (parent, args) => {
    //   console.log('test')
    //   //  let final = libraries.filter((a) => a.name.includes(args.name))
    //   return libraries.filter((a) => a.name.includes(args.name))
    // },
    // getLibrary: (parent, args) => {
    //   return libraries
    // },
    // getAllBooks: (parents, args) => {
    //   console.log('args', args)
    //   if (!args.status) {
    //     return books
    //   } else {
    //     return books.filter((book) => book.status === args.status)
    //   }
    // },
    // getBookById: (parent, args) => {
    //   let bookById = books.filter((book) => book.id === args.id)
    //   console.log('args', bookById)

    //   return bookById
    // },
    // getBooksByAuthor: (parent, args) => {
    //   let bookList = books.filter((a) => a.author === args.author)
    //   return bookList
    // },
  },
  Post: {
    id: (parents, args) => {
      return parents.number
    },
    comment: (parents, args) => {
      return parents.words
    },
    user: (parents, args) => {
      console.log('parn', parents)
      return {
        id: parents.people.id,
        fName: parents.people.fName,
        lName: parents.people.lName,
      }
    },
  },
  Mutation: {
    createPost: (parents, args) => {
      return {
        comment: args.comment,
      }
    },
    // setBookStatus: (parents, args) => {
    //   // console.log('set', args)
    //   let bookStatus = books.find((a) => a.id === args.id)
    //   bookStatus.status = args.status
    //   console.log('BRYAN', bookStatus)
    //   // console.log('books', bookStatus.status)
    //   pubsub.publish(BOOK_STATUS_SET, {
    //     //will hit the bookStatusSet subscrition resolver
    //     bookStatusSet: {
    //       changed: new Date(),
    //       book: bookStatus,
    //     },
    //   })
    //   return {
    //     book: bookStatus,
    //     changed: new Date(),
    //   }
    // },
  },
}

const server = new ApolloServer({ typeDefs, resolvers, client })

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})
