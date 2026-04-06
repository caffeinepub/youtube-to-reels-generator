import Text "mo:core/Text";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Order "mo:core/Order";

actor {
  type Clip = {
    id : Text;
    title : Text;
    description : Text;
    voiceoverScript : Text;
    imageUrl : Text;
    createdAt : Time.Time;
  };

  module Clip {
    public func compare(clip1 : Clip, clip2 : Clip) : Order.Order {
      Text.compare(clip1.id, clip2.id);
    };
  };

  let clips = Map.empty<Text, Clip>();

  func getClipInternal(id : Text) : Clip {
    switch (clips.get(id)) {
      case (null) { Runtime.trap("Clip not found") };
      case (?clip) { clip };
    };
  };

  public shared ({ caller }) func createClip(id : Text, title : Text, description : Text) : async Clip {
    if (clips.containsKey(id)) {
      Runtime.trap("Clip with this ID already exists");
    };
    let newClip : Clip = {
      id;
      title;
      description;
      voiceoverScript = "";
      imageUrl = "";
      createdAt = Time.now();
    };
    clips.add(id, newClip);
    newClip;
  };

  public query ({ caller }) func getClip(id : Text) : async Clip {
    getClipInternal(id);
  };

  public query ({ caller }) func getAllClips() : async [Clip] {
    clips.values().toArray().sort();
  };

  public shared ({ caller }) func updateClipContent(id : Text, voiceoverScript : Text, imageUrl : Text) : async () {
    let clip = getClipInternal(id);
    let updatedClip : Clip = {
      id = clip.id;
      title = clip.title;
      description = clip.description;
      voiceoverScript;
      imageUrl;
      createdAt = clip.createdAt;
    };
    clips.add(id, updatedClip);
  };

  public shared ({ caller }) func deleteClip(id : Text) : async () {
    if (not clips.containsKey(id)) {
      Runtime.trap("Clip not found");
    };
    clips.remove(id);
  };
};
