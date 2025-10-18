import { Hono } from "hono";
import { PrismaClient } from "../generated/prisma/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { verify } from "hono/jwt";
import { createBlogInput, updateBlogInput } from "@batxdev/medium-common";

export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET : string;
  },
  Variables:{
    userId: string;
  }
}>();

blogRouter.use('/*', async(c, next) => {
  // Skip auth for bulk endpoint
  if (c.req.path.endsWith('/bulk')) {
    await next();
    return;
  }
  
  try {
    //extract the userId 
    //pass it down to the route handler
    const authHeader = c.req.header("authorization") || "";
    const user = await verify(authHeader, c.env.JWT_SECRET);

    if(user){
      c.set("userId", user.id as string);
      await next();
    }
    else{
      c.status(403);
      return c.json({
        message: "You are not logged in"
      })
    }
  } catch(e) {
    c.status(403);
    return c.json({
      message: "Invalid token"
    })
  }
})

blogRouter.post("/", async(c) => {
  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const body = await c.req.json();
    const {success} = createBlogInput.safeParse(body);
    if(!success){
      c.status(411);
      return c.json({
        message: "Inputs invalid"
      })
    }

    const authorId = c.get("userId");
    const blog = await prisma.blog.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: Number(authorId)
      }
    })
    return c.json({
      id: blog.id,
    });
  } catch(e) {
    // Log error for debugging
    c.status(500);
    return c.json({
      message: "Error creating blog post"
    });
  }
});

blogRouter.put("/", async(c) => {
  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const body = await c.req.json();
    const {success} = updateBlogInput.safeParse(body);
    if(!success){
      c.status(411);
      return c.json({
        message: "Inputs invalid"
      })
    }

    const blog = await prisma.blog.update({
      where:{
        id: body.id
      },
      data: {
        title: body.title,
        content: body.content,
      }
    })
    return c.json({
      id: blog.id,
    });
  } catch(e) {
    // Log error for debugging
    c.status(500);
    return c.json({
      message: "Error updating blog post"
    });
  }
});

//pagination
blogRouter.get("/bulk", async(c) => {
  try {
    // Test if environment variables are accessible
    const dbUrl = c.env.DATABASE_URL;
    const jwtSecret = c.env.JWT_SECRET;
    
    if (!dbUrl) {
      return c.json({
        message: "DATABASE_URL not found",
        hasDbUrl: !!dbUrl,
        hasJwtSecret: !!jwtSecret
      });
    }


    const prisma = new PrismaClient({
      datasourceUrl: dbUrl,
    }).$extends(withAccelerate());

    const blogs = await prisma.blog.findMany({})

    return c.json({
      blogs
    })
  } catch(e: any) {
    // Return the actual error for debugging
    c.status(500);
    return c.json({
      message: "Error fetching blog posts",
      error: e.message || "Unknown error"
    });
  }
});

blogRouter.get("/:id", async(c) => {
  try {
    const id =  c.req.param("id");
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const blog = await prisma.blog.findFirst({
      where:{
        id: Number(id)
      }
    })

    if (!blog) {
      c.status(404);
      return c.json({
        message: "Blog post not found"
      })
    }

    return c.json({
      blog
    })
  } catch(e){
    // Log error for debugging
    c.status(500);
    return c.json({
      message: "Error while fetching blog post"
    })
  }
});

