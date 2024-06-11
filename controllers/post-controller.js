const {prisma} = require("../prisma/prisma-client");
const PostController = {
    createPost: async (req, res) => {
        const {content} = req.body;
        const authorId = req.user.userId;
        if(!content) return res.status(400).json({error: "Все поля обязательны!"});

        try {
            const post = await prisma.post.create({
                data: {
                    content,
                    authorId
                }
            })
            res.json(post);
        } catch (error) {
            console.error("Created post error", error);
            res.status(500).json({error: "Internal server error", error});
        }
    },
    getPostById: async (req, res) => {
        const {id} = req.params;
        const userId = req.user.userId;
        try {
            const post = await prisma.post.findUnique({
                where: {id},
                include: {
                    comments: {
                        include: {
                            user: true
                        }
                    },
                    likes: true,
                    author: true
                }
            })
            if(!post) return res.status(404).json({error: "Пост не найден!"});
            const postCurrentLikeUser = {
                ...post,
                likedByUser: post.likes.some(like => like.userId === userId)
            }
            res.json(postCurrentLikeUser);
        } catch (error) {
            console.error("Get Post by Id error", error);
            res.status(500).json({error: "Internal Server Error"});
        }
    },
    getAllPosts: async (req, res) => {
        const userId = req.user.userId;
        
        try {
            const posts = await prisma.post.findMany({
                include: {
                    likes: true,
                    author: true,
                    comments: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            })
            const postCurrentUser = posts.map(post => ({
                ...post,
                likedByUser: post.likes.some(like => like.userId === userId)
            }))
            res.json(postCurrentUser);
        } catch (error) {
            console.error("Get all post error", error);
            res.status(500).json({error: "Internal server error", error});
        }
    },
    deletePost: async (req, res) => {
        res.send("delete post");
    }
}
module.exports = PostController;