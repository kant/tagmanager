package services

import java.util.concurrent.atomic.AtomicBoolean

import com.amazonaws.services.sqs.model._
import play.api.Logger
import collection.JavaConverters._
import scala.annotation.tailrec
import scala.util.control.NonFatal

class SQSQueue(val queueName: String) {

  lazy val queueUrl = {
    val queueNameLookupResponse = SQS.SQSClient.getQueueUrl(new GetQueueUrlRequest(queueName))
    queueNameLookupResponse.getQueueUrl
  }

  def pollMessages(messageCount: Int, waitTimeSeconds: Int) = {
    val response = SQS.SQSClient.receiveMessage(
      new ReceiveMessageRequest(queueUrl).withWaitTimeSeconds(waitTimeSeconds).withMaxNumberOfMessages(messageCount)
    )
    response.getMessages.asScala.toList
  }

  def deleteMessage(message: Message) {
    SQS.SQSClient.deleteMessage(
      new DeleteMessageRequest(queueUrl, message.getReceiptHandle)
    )
  }

  def postMessage(message: String, delaySeconds: Int = 0): Unit = {
    SQS.SQSClient.sendMessage(
      new SendMessageRequest()
        .withQueueUrl(queueUrl)
        .withMessageBody(message)
        .withDelaySeconds(delaySeconds)
    )
  }
}

trait SQSQueueConsumer {
  def queue: SQSQueue
  def processMessage(message: Message): Unit

  val running = new AtomicBoolean(true)

  def stop = running.set(false)

  @tailrec
  final def run(): Unit = {
    if(running.get()) {
      try {
        for(message <- queue.pollMessages(1, 5)) { // only grab one message, do the rest of the cluster gets a chance
          Logger.debug(s"processing message form queue ${queue.queueName}")
          processMessage(message)

          queue.deleteMessage(message)
        }
      } catch {
        case NonFatal(e) => {
          Logger.error(s"error processing messages from job queue ${queue.queueName}", e)
        }
      }
      run
    }
  }
}
