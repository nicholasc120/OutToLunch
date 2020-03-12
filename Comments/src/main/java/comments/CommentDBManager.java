package comments;

import java.io.*;
import java.sql.Timestamp;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Scanner;

/**
 * Manages writing and reading comments from the DB.
 * 
 * @author Animal Farm
 * @date 2020-03-01
 */
public class CommentDBManager 
{
	//set to true and then fill in the actual db credentials for
	//maven compiling a jar for an AWS lambda.
	private static final boolean lambdaCompile = false;
	
	//Insert Comment statement
	private static final String INSERT_STATEMENT = "INSERT INTO comments.comment (commentID, postID, userID, parentID, content, date) VALUES (?,?,?,?,?,?)";
	
	//Query Comment statement
	private static final String SELECT_STATEMENT = "SELECT * FROM comments.comment WHERE postID = (?)";
	
	//Delete Comment statement
	private static final String DELETE_STATEMENT = "DELETE FROM comments.comment WHERE postID = (?)";
	
	//Connection to the DB
	Connection dbConn;
	
	//DB url
	String url;
	
	//DB user
	String user;
	
	//DB password
	String password;
	
	/**
	 * Read a given config file to get the DB credentials.
	 * Make sure the config file has no spaces.
	 * 
	 * @param filename filename of config file.
	 */
	void readDBCredentials(String filename)
	{
		//Read credentials from an ini file (doesn't work with lambda)
		if(!lambdaCompile)
		{
			File configFile = new File(filename);
			try
			{
				Scanner fileScanner = new Scanner(configFile);
				
				//parse url
				String line = fileScanner.nextLine();
				url=line.substring(line.indexOf('=')+1);
				
				//parse user
				line = fileScanner.nextLine();
				user=line.substring(line.indexOf('=')+1);
				
				//parse password
				line = fileScanner.nextLine();
				password=line.substring(line.indexOf('=')+1);
				
				fileScanner.close();	
			}
			catch(IOException e)
			{
				e.printStackTrace();
				System.exit(-1);
			}
		}
		else
		{
			//hard code the DB credentials when compiling with maven for lambda
			url="";
			user="";
			password="";
		}
	}
	
	/**
	 * Init the DB connection
	 */
	void initDBConnection()
	{
		try 
		{
			Class.forName("com.mysql.cj.jdbc.Driver");
			dbConn = DriverManager.getConnection(url, user, password);
			System.out.println("Connected to DB successfully.");
		} 
		catch (SQLException e) 
		{
			e.printStackTrace();
			System.exit(-1);
		} 
		catch (ClassNotFoundException e) 
		{
			e.printStackTrace();
			System.exit(-1);
		}
	}
	
	/**
	 * Insert a comment into the comment DB
	 *
	 * @param com Comment object to insert.
	 */
	void insertCommentRow(Comment com)
	{
		try 
		{
			//prepare the statement		
			PreparedStatement dbInsertPS = dbConn.prepareStatement(INSERT_STATEMENT);
			dbInsertPS.setString(1, com.getCommentID());		
			dbInsertPS.setString(2, com.getPostID());
			dbInsertPS.setString(3, com.getUserID());
			dbInsertPS.setString(4, com.getParentID());
			dbInsertPS.setString(5, com.getContent());
			dbInsertPS.setTimestamp(6, com.getDate());		
			
			//execute
			dbInsertPS.executeUpdate();
			
			dbInsertPS.close();
		} 
		catch (SQLException e) 
		{
			e.printStackTrace();
			System.exit(-1);
		}
		catch(NullPointerException n)
		{
			System.out.println("Error: DB not Inited.");
			System.exit(-1);
		}
	}
	
	/**
	 * Query comments from the comment DB
	 * Using a post ID.
	 *
	 * @param postID postID of the comment to delete
	 * @return JSON string of the returned comments
	 */
	public String queryCommentsByPostID(String postID)
	{
		String commentListJSON = "";		
		try 
		{
			//prepare the statement		
			PreparedStatement dbSelectPS = dbConn.prepareStatement(SELECT_STATEMENT);
			dbSelectPS.setString(1, postID);
			
			//execute
			ResultSet resultSet = dbSelectPS.executeQuery();
			
			//parse comment from resultSet
			ArrayList<Comment> commentList= new ArrayList<Comment>();
			while(resultSet.next())
			{
				Comment parseComment = new Comment
					(
						resultSet.getString("commentID"),
						resultSet.getString("postID"),
						resultSet.getString("userID"),
						resultSet.getString("parentID"),
						resultSet.getString("content"),
						resultSet.getTimestamp("date")	
					);
				commentList.add(parseComment);
			}
			
			dbSelectPS.close();
			
			//Convert comment arraylist to JSON format
			if(commentList.size() > 0)
			{
				for(int i=0; i<commentList.size()-1; i++)
					commentListJSON += commentList.get(i).toJSON() + ", ";
				commentListJSON += commentList.get(commentList.size()-1).toJSON();
			}
		} 
		catch (SQLException e) 
		{
			e.printStackTrace();
			System.exit(-1);
		}
		catch(NullPointerException n)
		{
			System.out.println("Error: DB not Inited.");
			System.exit(-1);
		}
		
		return commentListJSON;
	}	
	
	/**
	 * delete all comments on a post from the comment DB
	 * Using a post ID.
	 *
	 * @param postID postID of the comment to delete
	 */
	void deleteCommentsByPostID(String postID)
	{
		try 
		{
			//prepare the statement		
			PreparedStatement dbDeletePS = dbConn.prepareStatement(DELETE_STATEMENT);
			dbDeletePS.setString(1, postID);
			
			//execute
			dbDeletePS.executeUpdate();
			
			dbDeletePS.close();
		} 
		catch (SQLException e) 
		{
			e.printStackTrace();
			System.exit(-1);
		}
		catch(NullPointerException n)
		{
			System.out.println("Error: DB not Inited.");
			System.exit(-1);
		}
	}		
	
	/**
	 * close DB connection
	 */
	void closeDBConnection()
	{
		try 
		{
			dbConn.close();
		} 
		catch (SQLException e) 
		{
			e.printStackTrace();
		}
	}
	
	/**
	 * Main tests connecting to the DB (requires correct config file),
	 * inserting 2 comments, and then reading them by post.
	 * 
	 * @param args
	 */
	public static void main(String[] args) 
	{
		System.out.println("Hello Comment World!");
		
		//connect to the database
		CommentDBManager dbManager = new CommentDBManager();
		dbManager.readDBCredentials("src/main/java/comments/config.ini");
		
		dbManager.initDBConnection();
		
		//insert comment 1		
		Comment comment1 = new Comment("cID1", "pID1", "uID1", "", "This is test comment 1.", new Timestamp(System.currentTimeMillis()));
		dbManager.insertCommentRow(comment1);
		
		//insert comment 2
		Comment comment2 = new Comment("cID2", "pID1", "uID2", "cID1", "This is test comment 2.", new Timestamp(System.currentTimeMillis()));
		dbManager.insertCommentRow(comment2);
				
		//read comments
		System.out.println(dbManager.queryCommentsByPostID("pID1"));
		
		//delete comments
		dbManager.deleteCommentsByPostID("pID1");
		
		//close
		dbManager.closeDBConnection();
	}
}
